// --- LOGIC ENGINE v7.3 (Final Balance) ---

// チュートリアル用の状態変数
let isTutorialMode = false;
let tutStep = 0;

class SeededRandom {
  constructor(seedStr) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
    }
    this.a = h >>> 0;
  }
  next() {
    let t = this.a += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}
let rng = null;

// --ヘルパー関数 ---
function colorize(text) {
  if (!text) return "";
  return text
    .replace(/炎/g, '<span style="color:#ff9999; font-weight:bold;">炎</span>')
    .replace(/水/g, '<span style="color:#99ccff; font-weight:bold;">水</span>')
    .replace(/風/g, '<span style="color:#99ffcc; font-weight:bold;">風</span>');
}


let state = { 
  ans:{i:0,a:0,v:0}, rules:[], round:1, mana:0, maxMana:3, 
  liarIndex:-1, stoneCount:5, isOmega:false,
  currentSeed: "", currentMode: "",
  doomLimit: 0 // ラウンド制限(0は無制限)
};

function generateSeed(length) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function limitInput(el) {
  if(el.value < 1) el.value = 1;
  if(el.value > 5) el.value = 5;
}

function initMatrix() {
  const grid = document.getElementById('logic-matrix');
  grid.innerHTML = '<div></div>'; 
  for(let n=1; n<=5; n++) grid.innerHTML += `<div class="grid-header">${n}</div>`;
  const rows = [
    {label:"炎", color:"#ff9999", id:"m-i"},
    {label:"水", color:"#99ccff", id:"m-a"},
    {label:"風", color:"#99ffcc", id:"m-v"}
  ];
  rows.forEach(r => {
    grid.innerHTML += `<div class="grid-row-label" style="color:${r.color}">${r.label}</div>`;
    for(let n=1; n<=5; n++) {
      grid.innerHTML += `<div class="grid-cell" id="${r.id}-${n}" onclick="toggleCell(this)"></div>`;
    }
  });
  document.querySelectorAll('.memo-btn').forEach(btn => {
    btn.classList.remove('is-o');
    btn.classList.remove('is-x');
  });
}
function toggleCell(el) {
  if(el.classList.contains('cell-x')) {
    el.classList.remove('cell-x'); el.classList.add('cell-o');
  } else if(el.classList.contains('cell-o')) {
    el.classList.remove('cell-o');
  } else { el.classList.add('cell-x'); }
}
function toggleMemo(el) {
  if(el.classList.contains('is-x')) {
    el.classList.remove('is-x');
  } else if(el.classList.contains('is-o')) {
    el.classList.remove('is-o'); el.classList.add('is-x');
  } else { el.classList.add('is-o'); }
}
function toggleMemoArea() {
  document.getElementById('memo-pad').classList.toggle('closed');
}
function toggleMatrix() {
  const matrix = document.getElementById('logic-matrix');
  matrix.classList.toggle('closed');
}

function toggleProphecyList() {
  const container = document.getElementById('prophecy-container');
  container.classList.toggle('closed');
}



function setBackground(mode) {
    const body = document.body;
    switch(mode) {
        case 'easy':
            // Easy: 静寂の青
            body.style.backgroundImage = "radial-gradient(circle at 50% 50%, #1a252e 0%, #05080a 100%)"; 
            break;
        case 'standard':
            // Standard: 深い森の緑 (ボタンの色に合わせる)
            body.style.backgroundImage = "radial-gradient(circle at 50% 50%, #152e1a 0%, #050a05 100%)"; 
            break;
        case 'hard':
            // Hard: 危険な赤
            body.style.backgroundImage = "radial-gradient(circle at 50% 50%, #3e1a1a 0%, #0a0505 100%)"; 
            break;
        case 'nightmare':
            // Nightmare: 悪夢の紫
            body.style.backgroundImage = "radial-gradient(circle at 50% 50%, #2c1a3e 0%, #08050a 100%)"; 
            break;
        case 'chaos':
            // Chaos: 荒廃した茶色
            body.style.backgroundImage = "radial-gradient(circle at 50% 50%, #3e2723 0%, #000000 100%)"; 
            break;
        case 'omega':
            // Omega: 漆黒と微かな金
            body.style.backgroundImage = "radial-gradient(circle at 50% 50%, #1a1505 0%, #000000 100%)"; 
            break;
        case 'awakened':
            // 覚醒: 血のような赤と黒
            body.style.backgroundImage = "radial-gradient(circle at 50% 50%, #300 0%, #000 100%)";
            break;
           
        default:
            // タイトル画面など
            body.style.backgroundImage = "radial-gradient(circle at 50% 50%, #1a150e 0%, #000000 100%)";
    }
}


 function startGame(mode) {
  isTutorialMode = false;
  let newSeed = generateSeed(5);
  
  // ブーストONなら、IDの末尾に「+」を付ける！
  const isBoosted = boostState[mode] || false;
  if (isBoosted) {
    newSeed += "+";
  }
  
  initGame(mode, newSeed, isBoosted);
}

function startFromId(mode) {
  const input = document.getElementById('input-seed');
  let seed = input.value.trim().toUpperCase();
  if(!seed) { alert("IDを入力してください"); return; }
  closeIdModal();
  
  // ★重要変更: IDのお尻に「+」がついていたら、強制的にブーストONにする
  let isBoosted = boostState[mode] || false;
  
  if (seed.endsWith('+')) {
    isBoosted = true;
    // 「+」がついたままシードとして使うので、通常版とは全く違う乱数が生まれます
  } else if (isBoosted) {
    // UIでブーストONにしているのに「+」がない場合、付けてあげる
    seed += "+";
  }
  
  initGame(mode, seed, isBoosted);
}

function initGame(mode, seed, isBoosted = false, loadData = null) {

  // ★追加: ゲーム開始時は必ずスクロール禁止を解除する！
  document.body.style.overflow = '';

  // 未クリアならブースト解除
  const isUnlocked = localStorage.getItem('omega_awakened_unlocked') === 'true';
  if (seed && seed.endsWith('+')) {
    if (isUnlocked) {
      isBoosted = true;
    } else {
      seed = seed.slice(0, -1);
      isBoosted = false;
    }
  }

  document.getElementById('loading-indicator').style.display = 'block';
  document.querySelectorAll('.btn-action').forEach(b => b.style.display = '');
  
  // UIリセット
  const manaBar = document.querySelector('.mana-bar');
  if(manaBar) { manaBar.style.color = ""; manaBar.style.textShadow = ""; manaBar.classList.remove('glitch-active'); }
  const roundDisplay = document.getElementById('ui-round');
  if(roundDisplay && roundDisplay.parentNode) { roundDisplay.parentNode.classList.remove('glitch-active'); }
  const oldFrame = document.querySelector('.divine-frame');
  if(oldFrame) oldFrame.remove();
  
  // ゲーム終了フラグをリセット
  state.isGameEnded = false;

  rng = new SeededRandom(seed);
  state.currentSeed = seed;
  state.currentMode = mode;

  const isTower = (mode === 'tower');
  
  // 階層取得エラー回避 (undefinedなら1階とみなす)
  let floor = 1; 
  if (isTower) {
      if (typeof towerState !== 'undefined' && typeof towerState.floor === 'number') {
          floor = towerState.floor;
      } else {
          console.warn("Tower State Error: Floor reset to 1");
      }
  }

  setTimeout(() => {
    // --- 初期パラメータ設定 ---
    state.round = 1;
    state.mana = 0;
    state.totalChecks = 0;

    if (isTower) {
      // ★修正: タワーは全階層で「Awakened Omega」仕様（予言秘匿）
      state.stoneCount = 5;
      state.isOmega = true; // ← ここを true に固定！
      
      // 難易度（マナ・ラウンド）のみ階層で変化させる
      if (floor <= 5) {
        // 1F-5F: Awakened Standard (マナ3, R9)
        state.maxMana = 3; state.doomLimit = 9;
      } else if (floor <= 10) {
        // 6F-10F: Nightmare (マナ2, R9)
        state.maxMana = 2; state.doomLimit = 9;
      } else if (floor <= 15) {
        // 11F-15F: Rule Shift (マナ3, R8)
        state.maxMana = 3; state.doomLimit = 8;
      } else if (floor <= 19) {
        // 16F-19F: Chaos (マナ3, R10)
        state.maxMana = 3; state.doomLimit = 10;
      } else {
        // 20F: THE OMEGA (マナ3, R7)
        state.maxMana = 3; state.doomLimit = 7;
      }

    } else {
      // 通常モード設定
      switch(mode) {
        case 'easy': state.maxMana = 3; state.stoneCount = 4; state.doomLimit = 0; break;
        case 'standard': state.maxMana = 3; state.stoneCount = 5; state.doomLimit = 0; break;
        case 'hard': state.maxMana = 3; state.stoneCount = 5; state.doomLimit = 0; break;
        case 'nightmare': state.maxMana = 2; state.stoneCount = 5; state.doomLimit = 5; break;
        case 'chaos': state.maxMana = 3; state.stoneCount = 5; state.doomLimit = 0; break;
        case 'omega': state.maxMana = 3; state.stoneCount = 5; state.doomLimit = 0; break;
        case 'awakened': state.maxMana = 3; state.stoneCount = 5; state.doomLimit = 0; break;
      }
      state.isOmega = (mode === 'omega' || mode === 'awakened');
    }

    const resultBtn = document.getElementById('btn-show-result');
    if(resultBtn) resultBtn.style.display = 'none';

    // --- ルール生成 ---
    let success = false;
    let attempts = 0;
    const maxAttempts = 50000;

    while(!success && attempts < maxAttempts) {
      attempts++;
      state.ans = {
        i: Math.floor(rng.next()*5)+1,
        a: Math.floor(rng.next()*5)+1,
        v: Math.floor(rng.next()*5)+1
      };
      
      let picked = [];
      const pickFromPool = (pool, count, currentPicked) => {
           let candidates = [...pool];
           for (let k = candidates.length - 1; k > 0; k--) {
               const j = Math.floor(rng.next() * (k + 1));
               [candidates[k], candidates[j]] = [candidates[j], candidates[k]];
           }
           let selected = [];
           for(let r of candidates) {
             if(selected.length >= count) break;
             const totalList = [...currentPicked, ...selected];
             if(totalList.some(p => p.name === r.name)) continue;
             if(isConflict(totalList, r)) continue;
             selected.push(r);
           }
           return selected;
      };

      const allValid = POOL.filter(r => r.f(state.ans.i, state.ans.a, state.ans.v) === true);

      if (isTower) {
         // タワー用生成ロジック (難易度は維持)
         if (floor === 20) {
            const poolD4 = allValid.filter(r => (r.diff||1) === 4);
            if(poolD4.length < 5) continue; 
            const p = pickFromPool(poolD4, 5, picked);
            if(p.length < 5) continue; picked.push(...p);
         } else if (floor >= 11 && floor <= 15) {
            const poolD4 = allValid.filter(r => (r.diff||1) === 4);
            const poolD3 = allValid.filter(r => (r.diff||1) === 3);
            if(poolD4.length < 3 || poolD3.length < 2) continue;
            const p4 = pickFromPool(poolD4, 3, picked); if(p4.length < 3) continue; picked.push(...p4);
            const p3 = pickFromPool(poolD3, 2, picked); if(p3.length < 2) continue; picked.push(...p3);
         } else {
            // 1F-10F, 16F-19F (Awakened Standard構成)
            const poolD2 = allValid.filter(r => (r.diff||1) === 2);
            const poolD3 = allValid.filter(r => (r.diff||1) === 3);
            const poolD4 = allValid.filter(r => (r.diff||1) === 4);
            if(poolD2.length < 1 || poolD3.length < 1 || poolD4.length < 3) continue;
            const p2 = pickFromPool(poolD2, 1, picked); if(p2.length < 1) continue; picked.push(...p2);
            const p3 = pickFromPool(poolD3, 1, picked); if(p3.length < 1) continue; picked.push(...p3);
            const p4 = pickFromPool(poolD4, 3, picked); if(p4.length < 3) continue; picked.push(...p4);
         }
      } else if (mode === 'awakened') {
        const poolD2 = allValid.filter(r => (r.diff||1) === 2);
        const poolD3 = allValid.filter(r => (r.diff||1) === 3);
        const poolD4 = allValid.filter(r => (r.diff||1) === 4);
        if(poolD2.length < 1 || poolD3.length < 1 || poolD4.length < 3) continue;
        const p2 = pickFromPool(poolD2, 1, picked); if(p2.length < 1) continue; picked.push(...p2);
        const p3 = pickFromPool(poolD3, 1, picked); if(p3.length < 1) continue; picked.push(...p3);
        const p4 = pickFromPool(poolD4, 3, picked); if(p4.length < 3) continue; picked.push(...p4);
      } else {
        let minDiff = 1; let maxDiff = 3;
        if (mode === 'easy') maxDiff = 2;
        if (mode === 'hard' || mode === 'nightmare' || mode === 'omega') minDiff = 2;
        if (isBoosted) {
           const poolD4 = allValid.filter(r => (r.diff||1) === 4);
           if (poolD4.length === 0) continue; 
           const p4 = pickFromPool(poolD4, 1, picked);
           if (p4.length < 1) continue; picked.push(...p4);
        }
        let normalPool = allValid.filter(r => {
           let d = r.diff || 1;
           if(d < minDiff || d > maxDiff) return false;
           return true;
        });
        if (normalPool.length < (state.stoneCount - picked.length)) continue;
        const needed = state.stoneCount - picked.length;
        const pNormal = pickFromPool(normalPool, needed, picked);
        if (pNormal.length < needed) continue;
        picked.push(...pNormal);
      }
      
      let matches = 0;
      for(let i=1; i<=5; i++) {
        for(let a=1; a<=5; a++) {
          for(let v=1; v<=5; v++) {
             if(picked.every(rule => rule.f(i,a,v))) matches++;
          }
        }
      }

      if(matches === 1) {
        const isChaosMode = (mode === 'chaos');
        const isTowerChaos = (isTower && floor >= 16 && floor <= 19);

        if(isChaosMode || isTowerChaos) {
          const trueLiar = Math.floor(rng.next() * state.stoneCount);
          let solutionsForTrueLiar = countSolutionsWithLiar(picked, trueLiar);
          if(solutionsForTrueLiar === 1) {
            let isAmbiguous = false;
            for(let otherLiar = 0; otherLiar < state.stoneCount; otherLiar++) {
              if(otherLiar === trueLiar) continue; 
              let solutionsForOther = countSolutionsWithLiar(picked, otherLiar);
              if(solutionsForOther === 1) { isAmbiguous = true; break; }
            }
            if(!isAmbiguous) { state.rules = picked; state.liarIndex = trueLiar; success = true; }
          }
        } else {
          state.rules = picked; state.liarIndex = -1; success = true;
        }
      }
    }

    document.getElementById('loading-indicator').style.display = 'none';

    if(!success) {
      alert("生成失敗: 条件が厳しすぎます。再試行します。");
    } else {
      document.getElementById('title-screen').style.display = 'none';
      const tutBtn = document.getElementById('top-tut-btn');
      if(tutBtn) tutBtn.style.display = 'none';
      document.getElementById('game-screen').style.display = 'block';
      
      if(isTower) {
         updateTowerUI(floor);
      } else {
         setBackground(mode);
         document.body.classList.remove('bg-tower-1', 'bg-tower-2', 'bg-tower-3', 'bg-tower-4', 'bg-tower-5');
      }

      const hud = document.querySelector('.hud');
      const oldId = document.getElementById('current-id-display');
      if(oldId) oldId.remove();
      if(!isTower) {
        const boostMark = isBoosted ? ' <span style="color:#ff0000; font-weight:bold;"><br><img src="assets/images/icon_skull.png" class="boost-img img-danger" alt="skull"></span>' : '';
        hud.insertAdjacentHTML('afterend', `<div id="current-id-display" style="text-align:center; color:#555; font-size:0.7rem; margin-top:-10px;">ID: <span style="font-family:'Cinzel',serif; color:#777;">${state.currentSeed}</span>${boostMark}</div>`);
      } else {
         hud.insertAdjacentHTML('afterend', `<div id="current-id-display"></div>`);
         updateTowerUI(floor);
      }

      document.getElementById('omega-rule-area').style.display = state.isOmega ? 'block' : 'none';

      initMatrix();
      initRuneImages();
      renderProphecies();

      // --- ロードデータの復元 ---
      if (loadData) {
          state.round = loadData.round;
          state.mana = loadData.mana;
          state.totalChecks = loadData.totalChecks;
          
          if (loadData.logHtml) document.getElementById('log-container').innerHTML = loadData.logHtml;
          
          if (loadData.r1) {
              document.getElementById('r1').value = loadData.r1;
              document.getElementById('r2').value = loadData.r2;
              document.getElementById('r3').value = loadData.r3;
              updateRuneImage('img-r1', loadData.r1, '#ff9999');
              updateRuneImage('img-r2', loadData.r2, '#99ccff');
              updateRuneImage('img-r3', loadData.r3, '#99ffcc');
          }
          if (loadData.memo) document.querySelector('.memo-textarea').value = loadData.memo;

          if (loadData.disabledIndices) {
              loadData.disabledIndices.forEach(idx => {
                  const s = document.getElementById(`stone-${idx}`);
                  if(s) s.classList.add('disabled');
              });
          }
          if (loadData.omegaExcludedIndices && state.isOmega) {
               const items = document.querySelectorAll('.omega-list-item');
               loadData.omegaExcludedIndices.forEach(idx => {
                   if(items[idx]) items[idx].classList.add('excluded');
               });
          }
          localStorage.removeItem('omega_tower_save');
      }

      updateHUD(); 

      if (!loadData) {
          const chaosWarn = document.getElementById('chaos-warning');
          const nmWarn = document.getElementById('nightmare-warning');
          if(chaosWarn) { chaosWarn.style.display = 'none'; chaosWarn.classList.remove('visible'); }
          if(nmWarn) { nmWarn.style.display = 'none'; nmWarn.classList.remove('visible'); }

          if (mode === 'chaos' || (isTower && floor >= 16 && floor <= 19)) {
            executeChaosIntro();
          }
          if (mode === 'nightmare' || (isTower && floor >= 6 && floor <= 10)) {
            executeNightmareIntro();
          }
      }
    }
    const towerOverlay = document.getElementById('tower-entry-anim-overlay');
      if (towerOverlay && towerOverlay.style.display !== 'none') {
          // 0.5秒待ってから幕を上げる（ゲーム画面が描画されるのを待つため）
          setTimeout(() => {
              towerOverlay.style.transition = 'opacity 1.5s ease-out';
              towerOverlay.style.opacity = '0';
              setTimeout(() => {
                  towerOverlay.style.display = 'none';
              }, 1500);
          }, 500);
      }
  }, 100);
}


// ヘルパー関数: 指定した石碑が嘘つきだと仮定した場合の解の個数を数える
function countSolutionsWithLiar(rules, liarIdx) {
  let count = 0;
  for(let i=1; i<=5; i++) {
    for(let a=1; a<=5; a++) {
      for(let v=1; v<=5; v++) {
         let validCount = 0;
         rules.forEach((r, idx) => {
           let res = r.f(i, a, v);
           if(idx === liarIdx) res = !res; // こいつが嘘つきだと反転
           if(res) validCount++;
         });
         // 全てのルールを満たすならカウント
         if(validCount === rules.length) count++;
      }
    }
  }
  return count;
}


// ▼▼▼ 演出用関数 ▼▼▼
async function executeNightmareIntro() {
  const slash = document.getElementById('nightmare-slash');
  const manaBar = document.querySelector('.mana-bar');
  const roundDisplay = document.getElementById('ui-round').parentNode;

  // 1. 一瞬の静寂と暗転
  document.body.style.filter = "brightness(0.5)";
  
  // 2. 斬撃！！
  if(slash) {
    slash.style.display = 'block';
    setTimeout(() => { 
        slash.style.display = 'none'; 
        document.body.style.filter = ""; 
    }, 200);
  }

  // 3. マナとラウンドを「破壊」して書き換える
  if(manaBar) manaBar.classList.add('glitch-active');
  if(roundDisplay) roundDisplay.classList.add('glitch-active');

  setTimeout(() => {
    // マナを3から2へ強制改変する視覚演出
    const uiMana = document.getElementById('ui-mana');
    const uiRound = document.getElementById('ui-round');

    if(uiMana) uiMana.innerHTML = '<span style="text-decoration:line-through; color:#555;">3</span> 0/2';
    
    // ★修正1: 固定の "1 / 5" ではなく、その階層の正しい設定値(state.doomLimit)を使う
    // これでタワーの8ラウンドが勝手に5にされるのを防ぎます
    if(uiRound) uiRound.innerText = `1 / ${state.doomLimit}`;
    
    // 4. 演出終了、色を禍々しく
    setTimeout(() => {
      if(manaBar) {
          manaBar.classList.remove('glitch-active');
          manaBar.style.color = "#ff0000";
          manaBar.style.textShadow = "0 0 10px #ff0000";
      }
      if(roundDisplay) roundDisplay.classList.remove('glitch-active');
      
      // ▼▼▼ 修正2: タワーモードなら警告文を出さない ▼▼▼
      if (state.currentMode !== 'tower') {
          const nmWarn = document.getElementById('nightmare-warning');
          if(nmWarn) {
            nmWarn.style.display = 'block'; // まず枠を作る
            setTimeout(() => {
               nmWarn.classList.add('visible'); // じわっと不透明度を上げる
            }, 100);
          }
      }
      // ▲▲▲▲▲▲▲▲▲▲

    }, 1000);
  }, 500);
}

function executeChaosIntro() {
  const stones = document.querySelectorAll('.stone');
  const warningBar = document.getElementById('chaos-warning');
  
  // 警告文を一旦隠す（念のため）
  if(warningBar) warningBar.classList.remove('visible');

  stones.forEach((stone, index) => {
    // 石碑の位置を取得
    const rect = stone.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const topY = rect.top + window.scrollY; // スクロール考慮

    // 呪いのオーブを生成
    const orb = document.createElement('div');
    orb.className = 'chaos-orb';
    document.body.appendChild(orb);

    // オーブの開始位置（画面上部）と終了位置を設定
    // アニメーションで制御するため、CSS変数で落差を渡す手もありますが、
    // ここではシンプルにWeb Animations APIを使います
    
    orb.style.left = (centerX - 10) + 'px'; // -10はオーブの半径
    orb.style.top = (topY - 500) + 'px'; // かなり上から

    // 落下アニメーション
    // ランダムな遅延を入れてバラバラ落ちてくるようにする
    const delay = index * 200; 
    const duration = 800;

    const animation = orb.animate([
      { transform: 'translateY(0) scale(1.5)', opacity: 0 },
      { transform: 'translateY(500px) scale(1)', opacity: 1 } // 500px落下して着弾
    ], {
      duration: duration,
      delay: delay,
      easing: 'cubic-bezier(0.5, 0, 1, 1)', // 加速しながら落ちる
      fill: 'forwards'
    });

    // 着弾時の処理
    setTimeout(() => {
      orb.remove(); // オーブ消滅
      stone.classList.add('chaos-infected'); // 石碑が感染！
      
      // SEがあればここで再生
    }, delay + duration);
  });

  // 全てが着弾した後に、警告文をじわっと表示
  setTimeout(() => {
    if(warningBar) {
      // 1. まず「透明な状態で」箱を出現させる
      warningBar.style.display = 'block'; 
      
      // 2. ブラウザが箱を描画するのをほんの少し(0.1秒)待つ
      setTimeout(() => {
        // 3. その後、クラスをつけてフェードイン開始！
        warningBar.classList.add('visible');
      }, 100); 
    }
  }, 1500); // 着弾待ち時間
}


// グローバル変数: 現在選択中のメモ欄を記憶する
let activeOmegaInput = null;

function renderProphecies() {
  const c = document.getElementById('prophecy-container');
  c.innerHTML = '';
  const names = ["α", "β", "γ", "δ", "ε"];
  
  // --- 1. Omegaモードのリスト表示部分 ---
  if (state.isOmega) {
    const listContainer = document.getElementById('omega-list');
    listContainer.innerHTML = '';
    
    // シャッフル表示
    let displayRules = [...state.rules];
    displayRules.sort(() => Math.random() - 0.5); 

    displayRules.forEach((r,idx) => {
      const item = document.createElement('div');
      item.className = 'omega-list-item';
      
      // ★追加: Awakenedモードなら専用クラスを付与
      if (state.currentMode === 'awakened') {
        item.classList.add('is-awakened');
      }

      item.innerHTML = colorize(r.name);
      
      const delay = 3000 + (idx * 100); 
      item.classList.add('falling');
      item.style.animationDelay = `${delay}ms`;
      
      setTimeout(() => {
        item.style.animation = 'none'; 
        item.style.opacity = '1'; 
        item.style.transform = 'translateY(0) scale(1)';
      }, delay + 3500);
      
      item.onmousedown = (e) => {
        if(activeOmegaInput) {
          e.preventDefault(); 
        }
      };

      item.onclick = () => {
        if (activeOmegaInput) {
          const currentText = activeOmegaInput.value;
          const newText = r.name.split(' (')[0]; 
          if(currentText) {
             activeOmegaInput.value = currentText + ", " + newText;
          } else {
             activeOmegaInput.value = newText;
          }
        } else {
          item.classList.toggle('excluded'); 
        }
      };
      listContainer.appendChild(item);
    });
  }

  // --- 2. 石碑の生成部分 ---
  state.rules.forEach((r, idx) => {
    // ラッパー作成
    let wrapper = document.createElement('div');
    let div = document.createElement('div');
    
    if (state.isOmega) {
      div.className = 'stone is-mystery';
      
      // ★追加: Awakenedモードなら専用クラスを付与
      if (state.currentMode === 'awakened') {
        div.classList.add('is-awakened');
      }

      div.classList.add('stone-fall'); 
      div.style.animationDelay = `${idx * 0.2}s`; 
      div.style.justifyContent = "space-between"; 
      
      div.onanimationend = () => {
        div.classList.remove('stone-fall');
        div.classList.add('omega-pulsing'); 
        div.style.opacity = 1; 
        div.style.transform = 'translateY(0)';
      };
      
      div.id = `stone-${idx}`;
      div.innerHTML = `
        <div class="stone-content">
          <div class="stone-title" style="display:block; color:#888;">予言 ${names[idx]}</div>
          <div class="stone-text" style="font-size:1.8rem; letter-spacing:3px;">???</div>
        </div>
        <div class="stone-id" style="color:#444;">${names[idx]}</div>
      `;
    } else {
      div.className = 'stone';
      div.id = `stone-${idx}`;
      div.innerHTML = `
        <div class="stone-content">
          <div class="stone-title">予言 ${names[idx]}</div>
          <div class="stone-text">${colorize(r.name)}</div> 
        </div>
        <div class="stone-id">${names[idx]}</div>
      `;
    }

    div.onclick = () => checkProphecy(idx, r, div);
    wrapper.appendChild(div);

    // 判定履歴を表示するミニログエリアを作成
    const miniLog = document.createElement('div');
    miniLog.id = `mini-log-${idx}`; 
    miniLog.className = 'mini-log-container';
    wrapper.appendChild(miniLog);

    // Ωモードならメモ欄とコピーボタンを追加
    if (state.isOmega) {
      const memoBox = document.createElement('div');
      memoBox.className = 'omega-memo-box';
      
      const input = document.createElement('textarea');
      input.className = 'omega-memo-input';
      input.placeholder = `予言${names[idx]} のメモ`;
      input.rows = 2; 
      
      // ★追加: Awakenedモードならメモ欄のボーダー色なども調整（任意）
      if (state.currentMode === 'awakened') {
        input.style.borderColor = "#500";
        input.style.color = "#ffcccc";
      }

      input.onfocus = () => { activeOmegaInput = input; };
      input.onblur = () => { 
        setTimeout(() => {
          if(activeOmegaInput === input) activeOmegaInput = null;
        }, 200);
      };
      
      const copyBtn = document.createElement('div');
      copyBtn.className = 'btn-omega-copy';

      // コピーボタンの色もモードで分岐
      const strokeColor = (state.currentMode === 'awakened') ? '#ff4d4d' : '#99ccff';
      
      copyBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" 
             stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
             style="pointer-events: none; filter: drop-shadow(0 0 3px ${strokeColor});">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" style="opacity: 0.6;"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;
      
      copyBtn.title = "内容をコピー";
      
      copyBtn.onclick = () => {
        if(!input.value) return;
        navigator.clipboard.writeText(input.value).then(() => {
          const originalHTML = copyBtn.innerHTML; 
          copyBtn.innerHTML = '✔'; 
          copyBtn.classList.add('copy-success');
          setTimeout(() => {
            copyBtn.innerHTML = originalHTML; 
            copyBtn.classList.remove('copy-success');
          }, 1500);
        });
      };

      memoBox.appendChild(input);
      memoBox.appendChild(copyBtn);
      wrapper.appendChild(memoBox);
    }

    c.appendChild(wrapper);
  });
}


// ▼▼▼ 高速化修正: 正規表現を定数として外に出す ▼▼▼
const CONFLICT_REGEX = /^(.+)と\d+の関係/;

function isConflict(pickedList, newRule) {
  // キャッシュした正規表現を使う（ここが高速化の肝！）
  const matchNew = newRule.name.match(CONFLICT_REGEX);
  if(matchNew) {
    const key = matchNew[1]; 
    return pickedList.some(p => {
       const matchP = p.name.match(CONFLICT_REGEX);
       return matchP && matchP[1] === key;
    });
  }
  return false;
}


function checkProphecy(idx, rule, el) {
  // チュートリアル制御
  if(isTutorialMode && tutStep !== 6 && tutStep !== 12 && tutStep !== 15 && tutStep !== 18) return;
  
  // マナ切れチェック
  if(state.mana >= state.maxMana) return;
  
  // 入力チェック
  const i = +document.getElementById('r1').value;
  const a = +document.getElementById('r2').value;
  const v = +document.getElementById('r3').value;
  if(!i || !a || !v) return;

  // これにより、封印解除画面(confirm-modal)のルーンはロックされません
  if(state.mana === 0) {
    document.querySelectorAll('.rune-container .rune-wrapper').forEach(e => e.classList.add('locked'));
    const msg = document.getElementById('rune-lock-msg');
    if(msg) msg.style.display = 'block';
  }
  
  // 最初の判定時にロック＆メッセージ表示
  if(state.mana === 0) {
    document.querySelectorAll('.rune-wrapper').forEach(e => e.classList.add('locked'));

    // ★追加: アクションボタンの無効化クラスも削除して復活させる
  document.querySelectorAll('.action-btn-item').forEach(btn => btn.classList.remove('disabled'));
  
  const msg = document.getElementById('rune-lock-msg');
  if(msg) msg.style.display = 'block';
}

  // 判定ロジック
  let isTrue = rule.f(i, a, v);
  if(idx === state.liarIndex) isTrue = !isTrue;

  // マナ消費と更新
  state.mana++;
  state.totalChecks++; 
  updateHUD();
  
  // 石碑を即座に無効化
  if(el) el.classList.add('disabled'); 

  // ▼▼▼ 演出開始！ ▼▼▼
  const popup = document.getElementById('judge-text');
  
  // 色と文字の設定
  if (isTrue) {
    popup.innerText = "TRUE";
    popup.style.color = "#d4af37"; // 金色
    popup.style.textShadow = "0 0 20px #d4af37";
  } else {
    popup.innerText = "FALSE";
    popup.style.color = "#9b59b6"; // 紫色
    popup.style.textShadow = "0 0 20px #9b59b6";
  }

  // アニメーション1: 出現
  popup.className = "en-font anim-pop-in";

  // 1秒後にログへ移動するアニメーション
  setTimeout(() => {
    popup.className = "en-font anim-drop-down";
    
    // さらに0.4秒後（吸い込まれた直後）にログへ追加
    setTimeout(() => {
      addLogEntry(idx, rule, isTrue, i, a, v);

      addMiniLog(idx, isTrue, i, a, v);
      // ポップアップをリセット
      popup.style.opacity = 0;
      popup.className = "en-font";
    }, 400);

  }, 1000); // ★ここで1秒溜めます
  
  // マナ切れ時の石碑無効化
  if(state.mana >= state.maxMana) {
    document.querySelectorAll('.stone').forEach(s => s.classList.add('disabled'));
  }
}

// ▼▼▼ ログ追加処理を切り出した関数 ▼▼▼
function addLogEntry(idx, rule, isTrue, i, a, v) {
  const log = document.getElementById('log-container');
  const entry = document.createElement('div');
  const names = ["α", "β", "γ", "δ", "ε"];
  
  // クラスによる配色はCSS側で制御
  entry.className = isTrue ? 'log-entry log-true' : 'log-entry log-false';
  
  // ふわっと出現させるアニメーション追加
  entry.style.animation = "fadeIn 0.5s";

  const numsHtml = `
    <span class="num-fire">${i}</span>-<span class="num-water">${a}</span>-<span class="num-wind">${v}</span>
  `;

  entry.innerHTML = `
    <div style="width:100%;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:bold;">R${state.round} 予言${names[idx]}</span>
        <strong>${isTrue ? "TRUE" : "FALSE"}</strong>
      </div>
      <div style="font-size:0.85rem; margin:4px 0; color:rgba(255,255,255,0.7); padding-left:8px; border-left:2px solid rgba(255,255,255,0.1);">
        ${state.isOmega ? "???" : colorize(rule.name)}
      </div>
      <div style="text-align:right;">
        <span class="log-nums" style="background:#000; padding:2px 8px; border-radius:4px; font-family:'Cinzel',serif;">${numsHtml}</span>
      </div>
    </div>
  `;
  
  // ログの一番上に追加
  log.prepend(entry);
}

function addMiniLog(idx, isTrue, i, a, v) {
  const container = document.getElementById(`mini-log-${idx}`);
  if(!container) return;

  const item = document.createElement('span');
  
  // T/Fの判定による背景色クラス
  item.className = isTrue ? 'mini-res-item mini-res-t' : 'mini-res-item mini-res-f';
  
  const label = isTrue ? 'T' : 'F';

  // ★変更点: 数字部分を span で囲って色クラス(num-fire等)を適用
  // 炎(i), 水(a), 風(v) の順です
  item.innerHTML = `
    <span class="mini-label">${label}</span>
    <span class="num-fire">${i}</span>-<span class="num-water">${a}</span>-<span class="num-wind">${v}</span>
  `;

  container.appendChild(item);
}

function nextRound() {
  // マナが残っているのに押した場合（通常時のみ無効化）
  if(state.mana === 0 && !isTutorialMode) return;
  
  // --- チュートリアル中の特別処理 ---
  if(isTutorialMode) {
    // ステップ9（ラウンド終了指示）の時だけ許可
    if(tutStep === 9) {
    
      spinNextIcon();
      state.round++;
      state.mana = 0;
      updateHUD();
      performRoundReset();
      nextTutorialStep(); // 次のステップへ
    }
    return;
  }

  // --- 通常時の処理 ---
  
  // ナイトメアモード等の「死の宣告」チェック
  if(state.doomLimit > 0 && state.round >= state.doomLimit) {
    finishGame(false, "遺跡崩壊");
    return;
  }
  
  spinNextIcon();
  state.round++;
  state.mana = 0;
  updateHUD();
  performRoundReset();
}

// ラウンド切り替え時の「お掃除」
function performRoundReset() {
  const r1 = document.getElementById('r1');
  const r2 = document.getElementById('r2');
  const r3 = document.getElementById('r3');
  
  // 1. 入力ロックを解除
  r1.disabled = false;
  r2.disabled = false;
  r3.disabled = false;
  
  // 3. 「ロック中」の警告メッセージを消す！
  const msg = document.getElementById('rune-lock-msg');
  if(msg) msg.style.display = 'none'; 

  // 4. 石碑のグレーアウトを解除
  document.querySelectorAll('.stone').forEach(s => s.classList.remove('disabled'));
  document.querySelectorAll('.rune-wrapper').forEach(e => e.classList.remove('locked'));
}

function attemptUnlock() {
  const i = +document.getElementById('r1').value;
  const a = +document.getElementById('r2').value;
  const v = +document.getElementById('r3').value;
  const isCorrect = (i === state.ans.i && a === state.ans.a && v === state.ans.v);
  
  finishGame(isCorrect);
}


// 1. ゲーム終了制御関数
function finishGame(isWin, titleOverride) {
  // --- 即時停止処理 ---
  window.scrollTo(0, 0); // スクロールリセット
  document.body.style.overflow = 'hidden'; // スクロール禁止
  state.isGameEnded = true;

  // アクションボタンを直ちに無効化
  document.querySelectorAll('.action-btn-item').forEach(btn => btn.classList.add('disabled'));

  // Ωルールエリアを隠す
  const omegaArea = document.getElementById('omega-rule-area');
  if(omegaArea) omegaArea.style.display = 'none';

  // --- ★★★ 20Fクリア時の特殊演出割り込み ★★★ ---
  if (isWin && state.currentMode === 'tower' && towerState.floor === 20) {
      playSingularityEnding(() => {
          // アニメーションが終わったら、通常のリザルト表示へ進む
          showResultModal(isWin, titleOverride);
      });
      return; // ここで一旦止めて、アニメーション関数に委ねる
  }
  // ★★★★★★★★★★★★★★★★★★★★★★★

  // 通常時はそのまま表示
  showResultModal(isWin, titleOverride);
}

// 2. リザルト画面表示関数（旧finishGameの後半部分）
function showResultModal(isWin, titleOverride) {
  // 入力値を取得 (ここで再取得します)
  const uI = document.getElementById('r1').value;
  const uA = document.getElementById('r2').value;
  const uV = document.getElementById('r3').value;

  const modal = document.getElementById('result-modal');
  
  // JSで強制的に中央配置スタイルを適用
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.paddingTop = '0';
  modal.style.paddingBottom = '0';

  modal.style.display = 'flex';
  
  // --- モードバッジ表示 (タワー対応) ---
  const modeBadge = document.getElementById('result-mode-badge');
  if(modeBadge) {
    if (state.currentMode === 'tower') {
         modeBadge.innerText = `FLOOR ${towerState.floor}`;
         modeBadge.style.color = "#d4af37";
         modeBadge.style.textShadow = "0 0 15px #8e44ad";
    } else {
        // 通常モードの表示ロジック
        let modeText = state.currentMode.toUpperCase();
        if (state.currentSeed && state.currentSeed.endsWith('+')) {
          modeText += "+";
        }
        modeBadge.innerText = modeText;
        
        let mColor = "#fff"; 
        let mGlow = "#fff";
        switch(state.currentMode) {
          case 'easy':     mColor = "#3498db"; mGlow = "#2980b9"; break;
          case 'standard': mColor = "#27ae60"; mGlow = "#2ecc71"; break;
          case 'hard':     mColor = "#e74c3c"; mGlow = "#c0392b"; break;
          case 'nightmare':mColor = "#9b59b6"; mGlow = "#8e44ad"; break;
          case 'chaos':    mColor = "#d35400"; mGlow = "#a04000"; break;
          case 'omega':    mColor = "#fff";    mGlow = "#d4af37"; break;
          case 'awakened': mColor = "#ff0000"; mGlow = "#500"; break;
        }
        modeBadge.style.color = mColor;
        modeBadge.style.textShadow = `0 0 15px ${mGlow}`;
    }
  }
  
  // 神演出 (Ωモード、またはタワー20階クリア時、またはタワークリア時全般)
  if (isWin && (state.isOmega || state.currentMode === 'tower')) {
    const frame = document.createElement('div');
    frame.className = 'divine-frame';
    
    // Awakenedモードなら赤
    if (state.currentMode === 'awakened') {
      frame.classList.add('is-awakened');
    }
    
    // タワーモードなら階層に応じて色を変える
    if (state.currentMode === 'tower') {
      const f = towerState.floor;
      if (f <= 5) frame.classList.add('tower-1');      // Cyan
      else if (f <= 10) frame.classList.add('tower-2'); // Purple
      else if (f <= 15) frame.classList.add('tower-3'); // Green
      else if (f <= 19) frame.classList.add('tower-4'); // Red
      else frame.classList.add('tower-5');              // Gold
    }

    document.body.appendChild(frame);
  }

  const title = document.querySelector('.seal-broken');
  if(isWin) {
    title.innerText = "封印解除";
    title.style.color = "#fff";
  } else {
    title.innerText = titleOverride || "解除失敗";
    title.style.color = "#c0392b";
  }
  
  document.getElementById('final-code').innerText = `${state.ans.i} ${state.ans.a} ${state.ans.v}`;

  const userDisplay = document.getElementById('user-input-display');
  if(userDisplay) {
    userDisplay.innerHTML = `YOUR CODE: <span style="color:${isWin ? '#fff' : '#e74c3c'}; border-bottom:1px solid #555;">${uI} ${uA} ${uV}</span>`;
  }
  
  document.getElementById('final-round').innerText = state.round;
  const checksEl = document.getElementById('final-checks');
  if(checksEl) checksEl.innerText = state.totalChecks;

  // 履歴保存
  saveHistory(isWin, {i:uI, a:uA, v:uV});

  const detailBox = document.getElementById('result-details');
  let html = '';
  const names = ["α", "β", "γ", "δ", "ε"];
  state.rules.forEach((r, idx) => {
      const isLiar = (idx === state.liarIndex);
      const liarTag = isLiar ? '<span class="res-liar-txt">[嘘つき]</span> ' : '';
      html += `<div class="res-row">
        <div><strong>予言${names[idx]}</strong>: ${liarTag}${r.name}</div>
        <div style="color:#d4af37; padding-left:10px; font-size:0.85rem;">
           👉 正解の法則: <strong>${r.desc}</strong>
        </div>
      </div>`;
  });
  detailBox.innerHTML = html;

  // ボタン要素を取得と設定
  const btns = document.querySelectorAll('#result-modal .btn');
  const nextBtn = btns[btns.length - 1]; 
  if (btns.length >= 2) {
      const reviewBtn = btns[0];
      reviewBtn.onclick = () => {
          // ★ここで既存の reviewBoard() を呼び出すのが重要です
          // これにより「RESULTボタン表示」「石碑のロック」が行われます
          reviewBoard(); 
          
          // ★スクロール復活 (ご提示の要望)
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
      };
  }

  // まずデフォルト状態にリセット
  nextBtn.onclick = softResetGame;
  nextBtn.innerText = "次の遺跡へ";
  nextBtn.style.background = "#d4af37";
  nextBtn.style.color = "#000";
  nextBtn.style.borderColor = "#fff";

  // ★ OMEGA TOWER モードの処理
  if (state.currentMode === 'tower') {
      
      const currentBest = parseInt(localStorage.getItem('omega_tower_best') || "0");
      if (towerState.floor > currentBest) {
          localStorage.setItem('omega_tower_best', towerState.floor);
      }

      if (isWin) {
          if (towerState.floor >= 20) {
              // 完全制覇
              title.innerText = "THE SINGULARITY";
              title.style.color = "#d4af37";
              title.style.textShadow = "0 0 30px #d4af37";
              
              nextBtn.innerText = "伝説として\n帰還";
              nextBtn.onclick = () => {
                  localStorage.removeItem('omega_tower_save'); // クリアしたのでセーブ削除
                  softResetGame();
              };
          } else {
              // 次の階層へ
              const nextF = towerState.floor + 1;
              nextBtn.innerText = `Floor ${nextF} へ`;
              
              // 自動セーブ
              localStorage.setItem('omega_tower_save', JSON.stringify({ 
                  floor: nextF,
                  runSeed: towerState.runSeed
              }));

              nextBtn.onclick = () => {
                  modal.style.display = 'none';
                  const frame = document.querySelector('.divine-frame');
                  if(frame) frame.remove();
                  
                  // 階段アニメーション
                  playStairsAnim(() => {
                      startTowerLevel(nextF);
                  });
              };
          }
      } else {
          // 敗北時
          title.innerText = "塔からの追放";
          title.style.color = "#9b59b6";
          
          nextBtn.innerText = "タイトルへ戻る";
          nextBtn.style.background = "#333";
          nextBtn.style.color = "#ccc";
          nextBtn.style.borderColor = "#777";
          
          localStorage.removeItem('omega_tower_save');
          
          nextBtn.onclick = () => {
              softResetGame(); 
          };
      }
  }

  // ★重要: 20Fクリア演出後は、リザルト画面自体をフワッと出す
  if (state.currentMode === 'tower' && towerState.floor === 20 && isWin) {
      modal.style.opacity = '0';
      modal.style.transition = 'opacity 2s ease';
      setTimeout(() => { modal.style.opacity = '1'; }, 100);
  } else {
      modal.style.opacity = '1';
      modal.style.transition = '';
  }
}

// 3. エンディングアニメーション実行関数
function playSingularityEnding(callback) {
  const overlay = document.getElementById('singularity-ending-overlay');
  if(!overlay) { if(callback) callback(); return; }

  // 1. オーバーレイ表示
  overlay.style.display = 'flex';
  overlay.classList.remove('s-active');
  void overlay.offsetWidth; // リフロー
  
  // 2. アニメーション開始
  overlay.classList.add('s-active');
  
  // スマホバイブレーション（収束...爆発！）
  if (navigator.vibrate) navigator.vibrate([50, 50, 50, 50, 100, 200, 1000]);

  // 3. 爆発の瞬間（約3秒後）にリザルトを裏で準備する
  setTimeout(() => {
      if(callback) callback();
  }, 3000);

  // 4. 完全終了後（4秒後）にオーバーレイを消す
  setTimeout(() => {
      overlay.style.display = 'none';
      overlay.classList.remove('s-active');
  }, 4000);
}

// ブースト状態を管理するオブジェクト
let boostState = {
  hard: false,
  nightmare: false,
  chaos: false,
  omega: false
};


checkAwakenedUnlock = function() {
  // Awakened 解放チェック
  const isUnlocked = localStorage.getItem('omega_awakened_unlocked') === 'true';
  
  const btn = document.getElementById('btn-awakened');
  if(btn) btn.style.display = isUnlocked ? 'flex' : 'none';

  ['hard', 'nightmare', 'chaos', 'omega'].forEach(m => {
    const bBtn = document.getElementById(`boost-${m}`);
    if(bBtn) bBtn.style.display = isUnlocked ? 'flex' : 'none';
  });

  const spacerEasy = document.getElementById('spacer-easy');
  const spacerStd = document.getElementById('spacer-std');
  if(spacerEasy) spacerEasy.style.display = isUnlocked ? 'flex' : 'none';
  if(spacerStd) spacerStd.style.display = isUnlocked ? 'flex' : 'none';

  // --- タワー解放チェック & ベストスコア表示 ---
  const isTowerUnlocked = localStorage.getItem('omega_tower_unlocked') === 'true';
  const btnSingularity = document.getElementById('btn-singularity');
  const scoreSpan = document.getElementById('tower-best-score');
  
  if(btnSingularity) {
    btnSingularity.style.display = isTowerUnlocked ? 'flex' : 'none';
    
    if (isTowerUnlocked && scoreSpan) {
      const bestVal = localStorage.getItem('omega_tower_best');
      const best = parseInt(bestVal || "0"); // 数値化
      
      if (best >= 20) {
          scoreSpan.innerText = "COMPLETE";
          scoreSpan.style.color = "#d4af37";
          scoreSpan.style.textShadow = "0 0 5px #d4af37";
      } else if (best > 0) {
          scoreSpan.innerText = `Best: ${best}F`;
          scoreSpan.style.color = "#aaa";
          scoreSpan.style.textShadow = "none";
      } else {
          scoreSpan.innerText = ""; // 0なら非表示
      }
    }
  }
};


// ブースト切り替え & 演出
function toggleBoost(mode) {
  boostState[mode] = !boostState[mode]; // ON/OFF反転
  
  const boostBtn = document.getElementById(`boost-${mode}`);
  
  if(boostState[mode]) {
    boostBtn.classList.add('active');
    
    // ★追加: じんわり警告メッセージを出す
    // ブーストボタンの隣にある「難易度ボタン」を探す
    const parentRow = boostBtn.parentElement;
    const modeBtn = parentRow.querySelector('.btn'); // 兄弟要素のボタン
    
    if(modeBtn) {
      // 既存のポップアップがあれば消す
      const oldMsg = modeBtn.querySelector('.boost-popup');
      if(oldMsg) oldMsg.remove();

      // メッセージ作成
      const msg = document.createElement('div');
      msg.className = 'boost-popup';
      
      // モード名を大文字で取得 (例: HARD)
      const modeName = mode.charAt(0).toUpperCase() + mode.slice(1);
      msg.innerText = `${modeName} 難易度上昇`;
      
      modeBtn.appendChild(msg);

      // アニメーションが終わったら消す
      setTimeout(() => {
        if(msg.parentNode) msg.remove();
      }, 2600);
    }

  } else {
    boostBtn.classList.remove('active');
  }
}


function saveHistory(isWin, userInput) {
  if (isTutorialMode) return;
  
  // 1. Awakened解放チェック (Omegaクリア時)
  if (state.currentMode === 'omega' && isWin) {
    if (localStorage.getItem('omega_awakened_unlocked') !== 'true') {
        localStorage.setItem('omega_awakened_unlocked', 'true');
        setTimeout(() => { playUnlockAnimation(); }, 500);
    }
  }

  // 2. ★追加: Tower解放チェック (Awakenedクリア時)
  if (state.currentMode === 'awakened' && isWin) {
    if (localStorage.getItem('omega_tower_unlocked') !== 'true') {
        localStorage.setItem('omega_tower_unlocked', 'true');
        setTimeout(() => { 
            playTowerUnlockAnimation();
        }, 500);
    }
  }

  const logHtml = document.getElementById('log-container') ? document.getElementById('log-container').innerHTML : "";
  const memoText = document.querySelector('.memo-textarea') ? document.querySelector('.memo-textarea').value : "";

  const historyItem = {
    seed: state.currentSeed,
    mode: state.currentMode,
    floor: (state.currentMode === 'tower' ? towerState.floor : null), // タワー階層を記録
    round: state.round,
    checks: state.totalChecks,
    win: isWin,
    date: new Date().toLocaleString(),
    ans: state.ans,
    input: userInput,
    logs: logHtml,
    memo: memoText
  };
  
  let history = JSON.parse(localStorage.getItem('omega_history') || '[]');
  history.unshift(historyItem);
  if(history.length > 30) history.pop();
  localStorage.setItem('omega_history', JSON.stringify(history));
}

/* --- script.js の showHistory 関数を置換 --- */

function showHistory() {
  const tutBtn = document.getElementById('top-tut-btn');
  if(tutBtn) tutBtn.style.display = 'none';

  const modal = document.getElementById('history-modal');
  const list = document.getElementById('history-list');
  const history = JSON.parse(localStorage.getItem('omega_history') || '[]');
  
  modal.style.display = 'flex';
  list.innerHTML = '';
  
  if(history.length === 0) {
    list.innerHTML = '<div style="color:#666; text-align:center; padding:20px;">記録なし</div>';
    return;
  }

  history.forEach((h, idx) => {
    const item = document.createElement('div');
    item.className = 'hist-item';
    let modeLabel = h.mode.toUpperCase();
    if(h.mode==='standard') modeLabel = 'STD';
    if(h.mode==='nightmare') modeLabel = 'NIGHT';
    
    // ★追加: タワーモードならIDを表示しない
    let idDisplay = `<span class="hist-id">#${h.seed}</span>`;
    if (h.mode === 'tower') {
        idDisplay = ''; // IDは非表示
        // その代わりモード名に階層を入れる
        const floorNum = h.floor || '?';
        modeLabel = `TOWER [F${floorNum}]`;
    }

    let detailHtml = "";
    if (h.ans && h.input) {
       const inputColor = h.win ? '#2ecc71' : '#e74c3c';
       detailHtml = `
         <div style="font-size:0.75rem; color:#aaa; margin-top:8px; border-top:1px dashed #333; padding-top:4px; display:flex; justify-content:space-between;">
           <span>正解: <span style="color:#d4af37; font-weight:bold;">${h.ans.i}-${h.ans.a}-${h.ans.v}</span></span>
           <span>入力: <span style="color:${inputColor}; font-weight:bold;">${h.input.i}-${h.input.a}-${h.input.v}</span></span>
         </div>
       `;
    }
    
    const checkCount = h.checks !== undefined ? h.checks : '?';
    
    item.innerHTML = `
      <div class="hist-left" style="width:100%;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
                <span class="hist-mode mode-${h.mode}">${modeLabel}</span>
                ${idDisplay}
            </div>
            <div style="display:flex; align-items:center;">
                <span class="hist-result ${h.win ? 'res-win':'res-lose'}" style="margin-right:8px;">${h.win ? 'WIN':'LOSE'}</span>
                <button class="btn-replay" onclick="openReview(${idx})" style="border-color:#aaa; color:#eee; cursor:pointer;">
                  🔍 記録
                </button>
            </div>
        </div>
        <div class="hist-date" style="margin-top:2px;">
           ${h.date} - Round:${h.round} <span style="color:#d4af37; margin-left:5px;">[${checkCount}手]</span>
        </div>
        ${detailHtml}
      </div>
      `;
    list.appendChild(item);
  });
}

// ▼▼▼ 追加関数: 履歴詳細を開く (手数表示対応版) ▼▼▼
function openReview(idx) {
  const history = JSON.parse(localStorage.getItem('omega_history') || '[]');
  const h = history[idx];
  if(!h) return;

  // 履歴一覧を一旦閉じる
  document.getElementById('history-modal').style.display = 'none';

  const modal = document.getElementById('review-modal');
  modal.style.display = 'flex';

  // ★追加: 手数 (checks) を取得
  const checkCount = h.checks !== undefined ? h.checks : '?';

  // 1. ヘッダー情報 (ここに手数を追加)
  const modeLabel = h.mode.toUpperCase();
  document.getElementById('review-header').innerHTML = `
    <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
      <span><span class="hist-mode mode-${h.mode}">${modeLabel}</span> #${h.seed}</span>
      <div style="text-align:right;">
        <div style="font-size:0.8rem; color:#888;">${h.date}</div>
        <div style="color:#d4af37; font-weight:bold; font-size:0.9rem;">総検証数: ${checkCount}手</div>
      </div>
    </div>
  `;

  // 2. 正解と入力の表示
  const resultBox = document.getElementById('review-answer-box');
  if(h.ans && h.input) {
    const winColor = h.win ? '#2ecc71' : '#e74c3c';
    resultBox.innerHTML = `
      <div style="display:flex; justify-content:space-around; align-items:center; font-family:'Cinzel', serif;">
        <div>
          <div style="font-size:0.7rem; color:#888;">CORRECT</div>
          <div style="font-size:1.2rem; color:#d4af37;">${h.ans.i} - ${h.ans.a} - ${h.ans.v}</div>
        </div>
        <div style="font-size:1.5rem; color:#555;">➡</div>
        <div>
          <div style="font-size:0.7rem; color:#888;">YOUR INPUT</div>
          <div style="font-size:1.2rem; color:${winColor}; text-decoration:underline;">${h.input.i} - ${h.input.a} - ${h.input.v}</div>
        </div>
      </div>
      <div style="margin-top:5px; font-weight:bold; color:${winColor}; font-size:0.9rem;">
        RESULT: ${h.win ? 'WIN (封印解除)' : 'LOSE (解除失敗)'}
      </div>
    `;
  } else {
    resultBox.innerHTML = '<span style="color:#666;">詳細データなし</span>';
  }

  // 3. メモの復元
  const memoArea = document.getElementById('review-memo');
  memoArea.value = h.memo || "(メモなし)";

  // 4. ログの復元
  const logArea = document.getElementById('review-log');
  if(h.logs) {
    logArea.innerHTML = h.logs;
  } else {
    logArea.innerHTML = '<div style="color:#666; padding:10px;">ログデータなし</div>';
  }
}


// 4. 詳細画面を閉じる関数
function closeReview() {
  const modal = document.getElementById('review-modal');
  if(modal) modal.style.display = 'none';
  // 履歴一覧に戻る
  const histModal = document.getElementById('history-modal');
  if(histModal) histModal.style.display = 'flex';
}

// ▲▲▲ 履歴システムここまで ▲▲▲


function startFromHistory(mode, seed) {
  closeHistory();
  initGame(mode, seed);
}

function reviewBoard() {
  document.getElementById('result-modal').style.display = 'none';
  const resultBtn = document.getElementById('btn-show-result');
  if(resultBtn) resultBtn.style.display = 'flex';
  
  document.getElementById('r1').disabled = true;
  document.getElementById('r2').disabled = true;
  document.getElementById('r3').disabled = true;
  document.querySelectorAll('.stone').forEach(s => s.classList.add('disabled'));
  document.querySelectorAll('.btn-action').forEach(b => b.style.display = 'none');

  if(state.liarIndex !== -1) {
      const liarStone = document.getElementById(`stone-${state.liarIndex}`);
      if(liarStone) liarStone.classList.add('is-liar');
  }
  
  if(state.isOmega) {
      const names = ["α", "β", "γ", "δ", "ε"];
      state.rules.forEach((r, idx) => {
          const s = document.getElementById(`stone-${idx}`);
          if(s) {
              s.innerHTML = `
                <div style="font-size:0.7rem; color:#aaa;">${names[idx]}</div>
                <div style="font-size:0.9rem; color:#fff;">${r.name}</div>
              `;
              s.style.background = "#222";
              s.style.border = "1px solid #777";
          }
      });
  }
}

function showResult() { document.getElementById('result-modal').style.display = 'flex'; }
// script.js の updateHUD 関数を修正

function updateHUD() {
  // 1. 既存のラウンド表示更新
  // 制限がある場合 "1 / 5" のように表示
  const roundText = (state.doomLimit > 0) ? `${state.round} / ${state.doomLimit}` : state.round;
  document.getElementById('ui-round').innerText = roundText;
  
  // 2. 既存のマナ表示更新
  document.getElementById('ui-mana').innerText = `${state.mana}/${state.maxMana}`;

  // --- ▼▼▼ 追加: 最終ラウンドなら「次へ」ボタンを封印する ▼▼▼ ---
  // "next-circle" クラスを持つ要素の親ボタンを探す
  const nextBtnIcon = document.querySelector('.next-circle');
  if (nextBtnIcon) {
    const nextBtn = nextBtnIcon.closest('.action-btn-item');
    
    // 制限あり、かつ現在ラウンドが上限に達しているなら
    if (state.doomLimit > 0 && state.round >= state.doomLimit) {
      nextBtn.classList.add('disabled'); // CSSで定義済みの無効化クラスを付与
    } else {
      nextBtn.classList.remove('disabled'); // それ以外なら復活させる
    }
  }
}
  // --- TUTORIAL LOGIC v2 ---
function startTutorial() {
  if (typeof colorize !== 'function') {
    window.colorize = function(t) { return t; };
  }

  isTutorialMode = true;
  tutStep = 0;
  
  const tutBtn = document.getElementById('top-tut-btn');
  if(tutBtn) tutBtn.style.display = 'none';
  
  const loader = document.getElementById('loading-indicator');
  if(loader) loader.style.display = 'block';
  
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('game-screen').style.display = 'block';
  
  // --- レイアウト変更 & QUITボタン追加 ---
  try {
    const txt = document.getElementById('tut-text');
    if(txt) txt.innerHTML = '<div style="text-align:center; color:#888;">システム起動中...</div>';

    // QUITボタンの存在確認と作成
    let quitBtn = document.getElementById('tut-quit-btn');
    const tutBox = document.getElementById('tut-box');
    if (tutBox && !quitBtn) {
      quitBtn = document.createElement('button');
      quitBtn.id = 'tut-quit-btn';
      quitBtn.innerText = "中断する";
      quitBtn.style.cssText = "position:absolute; top:10px; right:10px; background:transparent; border:1px solid #555; color:#888; font-size:0.7rem; padding:4px 8px; border-radius:4px; cursor:pointer;";
      quitBtn.onclick = quitTutorial;
      tutBox.appendChild(quitBtn);
    }
    if(quitBtn) quitBtn.style.display = 'block';

    // マトリクス非表示などは既存通り
    const matrix = document.getElementById('logic-matrix');
    if(matrix) matrix.style.display = 'none';
    const memoBtn = document.querySelector('.memo-toggle-btn');
    if(memoBtn) memoBtn.style.display = 'none';
    const memoPad = document.getElementById('memo-pad');
    if(memoPad) memoPad.style.display = 'none';
    const runeContainer = document.querySelector('.rune-container');
    if(runeContainer) {
       const matrixLabel = runeContainer.nextElementSibling;
       if(matrixLabel && matrixLabel.innerText && matrixLabel.innerText.includes('LOGIC')) {
          matrixLabel.style.display = 'none';
       }
    }

    // BOX移動
    const gameScreen = document.getElementById('game-screen');
    const prophecyContainer = document.getElementById('prophecy-container');
    if (gameScreen && tutBox && prophecyContainer) {
      gameScreen.insertBefore(tutBox, prophecyContainer);
      tutBox.classList.add('tut-embedded-mode');
      tutBox.style.display = 'flex';
    }
  } catch(e) { console.error("Layout Setup Error:", e); }
  
  setTimeout(() => {
    try {
      state.round = 1;
      state.mana = 0;
      state.totalChecks = 0;
      state.maxMana = 3; 
      state.stoneCount = 4; // ★変更: 4つにする
      
      // ★変更: 正解を 4-4-5 に設定 (風=5のルールと整合させるため)
      state.ans = { i:4, a:4, v:5 }; 
      
      state.liarIndex = -1;
      state.isOmega = false;
      
      state.rules = [
        { name:"炎と水の比較 (<, =, >)", desc:"炎 = 水", f:(i,a,v)=>i==a },
        { name:"合計と10の関係 (<, ≧)", desc:"合計 ≧ 10", f:(i,a,v)=>(i+a+v)>=10 },
        { name:"風と5の関係 (<, = )", desc:"風 = 5", f:(i,a,v)=>v==5 },
        { name:"炎の偶奇 (偶数, 奇数)", desc:"炎 = 偶数", f:(i,a,v)=>i%2==0 }
      ];
      
      setBackground('standard');
      updateHUD();
      
      const logContainer = document.getElementById('log-container');
      if(logContainer) logContainer.innerHTML = '';
      
      const chaosWarn = document.getElementById('chaos-warning');
      if(chaosWarn) chaosWarn.style.display = 'none';
      const omegaArea = document.getElementById('omega-rule-area');
      if(omegaArea) omegaArea.style.display = 'none';
      
      initMatrix();
      const matrix = document.getElementById('logic-matrix');
      if(matrix) matrix.style.display = 'none';
      
      const c = document.getElementById('prophecy-container');
      if(c) {
        c.innerHTML = '';
        const names = ["α", "β", "γ", "δ"]; // δを追加
        state.rules.forEach((r, idx) => {
          let div = document.createElement('div');
          div.className = 'stone';
          div.id = `stone-${idx}`;
          div.innerHTML = `
            <div class="stone-content">
              <div class="stone-title">予言 ${names[idx]}</div>
              <div class="stone-text">${colorize(r.name)}</div>
            </div>
            <div class="stone-id">${names[idx]}</div>
          `;
          div.onclick = () => { if(isTutorialMode) handleTutClick('stone', idx); };
          c.appendChild(div);
        });
      }

      document.getElementById('r1').value = "";
      document.getElementById('r2').value = "";
      document.getElementById('r3').value = "";

      nextTutorialStep(); 
    } catch(e) {
      alert("Tutorial Error: " + e);
    } finally {
      if(loader) loader.style.display = 'none';
    }
  }, 500);
}

// 数字を順番に入力する演出関数 (画像対応版)
function typeNumber(n1, n2, n3, callback) {
  const r1 = document.getElementById('r1');
  const r2 = document.getElementById('r2');
  const r3 = document.getElementById('r3');
  
  if(!r1 || !r2 || !r3) {
    if(callback) callback(); 
    return;
  }
  
  // 値をリセット（画像もリセットしてもいいですが、上書きするのでそのまま）
  r1.value = ""; r2.value = ""; r3.value = "";
  
  // リズムよく入力 & 画像更新
  setTimeout(() => { 
    r1.value = n1; 
    updateRuneImage('img-r1', n1, '#ff9999'); // 画像更新を追加
  }, 700);
  
  setTimeout(() => { 
    r2.value = n2; 
    updateRuneImage('img-r2', n2, '#99ccff'); 
  }, 1200);
  
  setTimeout(() => { 
    r3.value = n3; 
    updateRuneImage('img-r3', n3, '#99ffcc'); 
  }, 1600);
  
  setTimeout(() => {
    if(callback) callback();
  }, 3000);
}


function handleTutClick(type, idx) {
  // ステップ6: 石碑α
  if(tutStep === 6 && type === 'stone' && idx === 0) {
    checkProphecy(0, state.rules[0], document.getElementById('stone-0'));
    nextTutorialStep(); 
  }
  // ステップ12: 石碑β
  if(tutStep === 12 && type === 'stone' && idx === 1) {
    checkProphecy(1, state.rules[1], document.getElementById('stone-1'));
    nextTutorialStep(); 
  }
  // ステップ15: 石碑γ
  if(tutStep === 15 && type === 'stone' && idx === 2) {
    checkProphecy(2, state.rules[2], document.getElementById('stone-2'));
    nextTutorialStep(); 
  }
  // ★追加 ステップ18: 石碑δ
  if(tutStep === 18 && type === 'stone' && idx === 3) {
    checkProphecy(3, state.rules[3], document.getElementById('stone-3'));
    nextTutorialStep(); 
  }
}

const originalAttemptUnlock = attemptUnlock;

// ★修正: チュートリアル完了時に本番アニメーションを実行する
// ★修正版 attemptUnlock (チュートリアル成功対応)
/* --- script.js の attemptUnlock 関数を修正 --- */

attemptUnlock = function() {
  if(isTutorialMode) {
    // (チュートリアル用の処理はそのまま維持)
    if(tutStep === 22) {
      document.querySelectorAll('.tut-highlight').forEach(e => e.classList.remove('tut-highlight'));
      document.querySelectorAll('.tut-blink').forEach(e => e.classList.remove('tut-blink'));
      const quitBtn = document.getElementById('tut-quit-btn');
      if(quitBtn) quitBtn.style.display = 'none';
      const tutBox = document.getElementById('tut-box');
      if(tutBox) {
        tutBox.style.display = 'none';
        tutBox.classList.remove('tut-embedded-mode');
        document.body.appendChild(tutBox); 
      }
      document.getElementById('tut-overlay').style.display = 'none';
      
      const matrix = document.getElementById('logic-matrix');
      if(matrix) matrix.style.display = '';
      const memoBtn = document.querySelector('.memo-toggle-btn');
      if(memoBtn) memoBtn.style.display = '';
      const memoPad = document.getElementById('memo-pad');
      if(memoPad) memoPad.style.display = '';
      const runeContainer = document.querySelector('.rune-container');
      if(runeContainer) {
          const matrixLabel = runeContainer.nextElementSibling;
          if(matrixLabel) matrixLabel.style.display = '';
      }

      document.getElementById('final-1').value = document.getElementById('r1').value;
      document.getElementById('final-2').value = document.getElementById('r2').value;
      document.getElementById('final-3').value = document.getElementById('r3').value;

      executeUnlock();

      setTimeout(() => {
         alert("おめでとう！\nチュートリアルは完了だ。\nさあ、本番の遺跡へ挑もう！");
         quitTutorial();
      }, 4000);
    }
  } else {
    // --- 通常モード ---
    const i = document.getElementById('r1').value;
    const a = document.getElementById('r2').value;
    const v = document.getElementById('r3').value;
    
    const omegaArea = document.getElementById('omega-rule-area');
    if(omegaArea) omegaArea.style.display = 'none';

    if(!i || !a || !v) {
      alert("数字が入力されていません！");
      if(state.isOmega && omegaArea) omegaArea.style.display = 'block';
      return;
    }

    // 値を隠しinputに転記
    document.getElementById('final-1').value = i;
    document.getElementById('final-2').value = a;
    document.getElementById('final-3').value = v;

    // 画像も更新（黄金色）
    updateRuneImage('img-final-1', i, '#d4af37');
    updateRuneImage('img-final-2', a, '#d4af37');
    updateRuneImage('img-final-3', v, '#d4af37');

    // ★追加: 封印解除画面のルーンから「locked」クラスを強制削除
    // これでグレーアウトが解除され、明るくなります
    document.querySelectorAll('#confirm-modal .rune-wrapper').forEach(e => e.classList.remove('locked'));

    document.getElementById('confirm-modal').style.display = 'flex';
  }
};



function nextTutorialStep() {
  tutStep++;
  const txt = document.getElementById('tut-text');
  const btn = document.getElementById('tut-btn');
  
  // リセット
  document.querySelectorAll('.tut-highlight').forEach(e => e.classList.remove('tut-highlight'));
  document.querySelectorAll('.tut-blink').forEach(e => e.classList.remove('tut-blink'));
  document.getElementById('tut-overlay').style.display = 'block'; 
  
  btn.style.display = 'block'; 
  btn.innerText = "次へ ▶";

  const cFire = '<span style="color:#ff9999; font-weight:bold;">炎</span>';
  const cWater = '<span style="color:#99ccff; font-weight:bold;">水</span>';
  const cWind = '<span style="color:#99ffcc; font-weight:bold;">風</span>';

  switch(tutStep) {
    case 1:
      txt.innerHTML = `ようこそ、探求者よ。<br>
      このゲームの目的は<b>「答えが1つに絞られる、3桁の数字（1〜5まで）」</b>を特定することだ！<br>
      まずは画面右上を見てほしい。<br>
      ここには現在の<b>「ラウンド数」</b>が刻まれている。<br>
      一度セットした数字はラウンド終了まで変更できないぞ。`;
      const uiRound = document.getElementById('ui-round');
      if(uiRound && uiRound.parentNode) uiRound.parentNode.classList.add('tut-highlight', 'tut-blink');
      break;

    case 2:
      txt.innerHTML = `そしてその上が<b>「マナ」</b>だ。<br>
      石碑に問いかけるたびに 1 消費する。<br>
      マナが尽きると、回復するために次のラウンドに進むしかなくなる。`;
      const manaBar = document.querySelector('.mana-bar');
      if(manaBar) manaBar.classList.add('tut-highlight', 'tut-blink');
      break;

    case 3:
      txt.innerHTML = `では、調査を始めよう。<br>
      石碑に<b>「質問」</b>をして法則を暴き、隠された<b>「3つの数字」</b>を特定していこう。`;
      break;
      
    case 4:
      txt.innerHTML = `下にあるのが<b>「予言の石碑」</b>だ。<br>
      これらは正解の数字に関する「ある法則」を知っている。<br>まずはこれらに注目してほしい。`;
      const pContainer = document.getElementById('prophecy-container');
      if(pContainer) pContainer.classList.add('tut-highlight', 'tut-blink'); 
      break;

    case 5:
      txt.innerHTML = `上の入力欄を使って、石碑に質問を投げかける。<br>
      試しに<b>「1 - 1 - 1」</b>という数字をセットしてみよう。<br>
      (${cFire}:1, ${cWater}:1, ${cWind}:1 という意味だ)`;
      
      const runeBox = document.querySelector('.rune-container');
      if(runeBox) runeBox.classList.add('tut-highlight', 'tut-blink');
      btn.style.display = 'none';
      
      setTimeout(() => {
        if (typeof typeNumber !== 'function') {
           document.getElementById('r1').value = 1; document.getElementById('r2').value = 1; document.getElementById('r3').value = 1;
           btn.style.display = 'block'; btn.innerText = "OK"; return;
        }
        typeNumber(1, 1, 1, () => {
             txt.innerHTML = `よし。「1 - 1 - 1」とセット完了だ。<br>
             これで石碑に聞く準備が整った。`;
             btn.style.display = 'block'; btn.innerText = "OK";
        });
      }, 500);
      break;
      
    case 6:
      txt.innerHTML = `「もし正解が 1-1-1 だったら、お前の法則を満たすか？」<br>
      一番上の<b>「予言 α」</b>にそう聞いてみよう。<br>
      タップして判定を行え。`;
      const s0 = document.getElementById('stone-0');
      if(s0) s0.classList.add('tut-highlight', 'tut-blink');
      btn.style.display = 'none'; 
      break;

    case 7: 
      const logTrue = `
        <div class="log-entry log-true" style="margin-top:10px; text-align:left;">
          <div style="width:100%;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:bold;">R1 予言α</span> <strong>TRUE</strong>
            </div>
            <div style="font-size:0.85rem; margin:4px 0; color:#ddd; padding-left:8px; border-left:2px solid rgba(255,255,255,0.2);">
              ${colorize("炎と水の比較 (<, =, >)")}
            </div>
            <div style="text-align:right;"><span class="log-nums">1-1-1</span></div>
          </div>
        </div>`;
      txt.innerHTML = `石碑の反応があったぞ！<br>${logTrue}<br>「1-1-1」は条件（${cFire} = ${cWater}）を満たしているため <b>TRUE</b> となったのだ。`;
      document.getElementById('log-container').classList.add('tut-highlight');
      break;

    case 8:
      txt.innerHTML = `これで「${cFire}と${cWater}が同じ」とわかった。<br>
      さて、別の数字を試したいところだが…<br>
      <b>一度セットした数字(1-1-1)は、このラウンド中は変更できない。</b>`;
      break;
      
      case 9:
      txt.innerHTML = `新しい数字を試すには、時間を進める必要がある。<br>
      左下の<b>「次のラウンドへ」</b>ボタンを押してくれ。<br>
      （ラウンドが進むとマナも回復するぞ）`;
      const nextBtn = document.querySelector('.next-circle').closest('.action-btn-item');
      if(nextBtn) nextBtn.classList.add('tut-highlight', 'tut-blink');
      btn.style.display = 'none'; // ユーザーがボタンを押すのを待つ
      break;

    case 10:
      txt.innerHTML = `よし！ <b>ラウンド2</b> に突入した。<br>
      これで入力欄のロックが解除され、再び自由に数字をセットできる。<br>
      さあ、検証の続きだ。`;
      document.getElementById('ui-round').parentNode.classList.add('tut-highlight');
      break;

    case 11:
      txt.innerHTML = `次は合計がとても小さい<b>「1 - 1 - 2」</b>（合計4）を入力しよう。`;
      const runeBox2 = document.querySelector('.rune-container');
      if(runeBox2) runeBox2.classList.add('tut-highlight', 'tut-blink');
      btn.style.display = 'none';
      setTimeout(() => {
        if (typeof typeNumber !== 'function') {
           document.getElementById('r1').value = 1; document.getElementById('r2').value = 1; document.getElementById('r3').value = 2;
           btn.style.display = 'block'; btn.innerText = "OK"; return;
        }
        typeNumber(1, 1, 2, () => {
             btn.style.display = 'block'; btn.innerText = "OK";
        });
      }, 500);
      break;

    case 12:
      txt.innerHTML = `真ん中の<b>「予言 β」</b>をタップしろ。<br>
      この石碑は「合計」に関するルールを持っているようだ。`;
      const s1 = document.getElementById('stone-1');
      if(s1) s1.classList.add('tut-highlight', 'tut-blink');
      btn.style.display = 'none';
      break;

    case 13:
      const logFalse = `
        <div class="log-entry log-false" style="margin-top:10px; text-align:left;">
          <div style="width:100%;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:bold;">R2 予言β</span> <strong>FALSE</strong>
            </div>
            <div style="font-size:0.85rem; margin:4px 0; color:#ddd; padding-left:8px; border-left:2px solid rgba(255,255,255,0.2);">
              ${colorize("合計と10の関係 (<, ≧)")}
            </div>
            <div style="text-align:right;"><span class="log-nums">1-1-2</span></div>
          </div>
        </div>`;
      txt.innerHTML = `判定が出た！<br>${logFalse}<br><b>FALSE</b>（偽り）だ。<br>合計4ではダメらしい。「合計はもっと大きい（10以上）」ということだ！`;
      document.getElementById('log-container').classList.add('tut-highlight');
      break;

    case 14:
      txt.innerHTML = `FALSEが出たことで、正解を絞り込めた。<br>
      しかしまだ情報が足りない。<br>
      続いて<b>「予言 γ」</b>も調べておこう。`;
      break;

    case 15:
      txt.innerHTML = `入力数字は<b>「1 - 1 - 2」</b>のままでいい。<br>
      <b>「予言 γ」</b>をタップして反応を見るんだ。`;
      const s2 = document.getElementById('stone-2');
      if(s2) s2.classList.add('tut-highlight', 'tut-blink');
      btn.style.display = 'none'; 
      break;

    case 16:
      const logGamma = `
        <div class="log-entry log-false" style="margin-top:10px; text-align:left;">
          <div style="width:100%;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:bold;">R2 予言γ</span> <strong>FALSE</strong>
            </div>
            <div style="font-size:0.85rem; margin:4px 0; color:#ddd; padding-left:8px; border-left:2px solid rgba(255,255,255,0.2);">
              ${colorize("風と5の関係 (<, = )")}
            </div>
            <div style="text-align:right;"><span class="log-nums">1-1-2</span></div>
          </div>
        </div>`;
      txt.innerHTML = `結果は…<br>${logGamma}<br>
      <b>FALSE</b>だ！<br>
      入力した${cWind}(2)ではダメだと言っている。<br>
      つまり、${cWind}<5ではなく、${cWind}=<b>「5」</b>で確定する！`;
      document.getElementById('log-container').classList.add('tut-highlight');
      break;

    // ★追加: 石碑δのフロー
    case 17:
      txt.innerHTML = `まだ終わりではない。最後の石碑がある。<br>
      <b>「予言 δ」</b>をタップして、偶数に関するルールを確認しよう。`;
      break;

    case 18:
      // 文言変更：偶数個数ではなく、炎の性質について
      txt.innerHTML = `<b>「予言 δ」</b>をタップせよ。<br>
      入力は「1 - 1 - 2」（炎は1）のままだ。<br>
      もし炎が偶数ならTRUE、奇数ならFALSEになるはずだ。`;
      const s3 = document.getElementById('stone-3');
      if(s3) s3.classList.add('tut-highlight', 'tut-blink');
      btn.style.display = 'none';
      break;

    case 19:
      const logDelta = `
        <div class="log-entry log-false" style="margin-top:10px; text-align:left;">
          <div style="width:100%;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:bold;">R2 予言δ</span> <strong>FALSE</strong>
            </div>
            <div style="font-size:0.85rem; margin:4px 0; color:#ddd; padding-left:8px; border-left:2px solid rgba(255,255,255,0.2);">
              ${colorize("炎の偶奇 (偶数, 奇数)")}
            </div>
            <div style="text-align:right;"><span class="log-nums">1-1-2</span></div>
          </div>
        </div>`;
      
      // 解説ロジックの修正
      txt.innerHTML = `結果は…<br>${logDelta}<br>
      <b>FALSE</b>だ！<br>
      入力した${cFire}「1」(奇数)では条件を満たさない。<br>
      つまり、正解の${cFire}は<b>「偶数 (2か4)」</b>でなければならない！`;
      document.getElementById('log-container').classList.add('tut-highlight');
      break;

    case 20:
      txt.innerHTML = `これですべての条件が揃った。<br>
      <ul style="font-size:0.85rem; padding-left:20px; color:#ddd; text-align:left;">
        <li>予言α: ${cFire} = ${cWater}</li>
        <li>予言β: 合計 ≧ 10</li>
        <li>予言γ: ${cWind} = 5</li>
        <li>予言δ: ${cFire} = 偶数</li>
      </ul>
      ${cFire}が2だと「2+2+5=9」で合計不足。<br>
      ならば、残る可能性はただ一つ！`;
      break;

    case 21:
      txt.innerHTML = `導き出した答え、<b>「4 - 4 - 5」</b>を入力せよ！<br>
      (合計13、風は5、炎は偶数、炎=水。完璧だ)<br>
      ※今回は特別に数字を書き換えてあげよう。`;
      const runeBox3 = document.querySelector('.rune-container');
      if(runeBox3) runeBox3.classList.add('tut-highlight', 'tut-blink');
      btn.style.display = 'none';
      setTimeout(() => {
        if (typeof typeNumber !== 'function') {
           document.getElementById('r1').value = 4; document.getElementById('r2').value = 4; document.getElementById('r3').value = 5;
           btn.style.display = 'block'; btn.innerText = "OK"; return;
        }
        typeNumber(4, 4, 5, () => {
             btn.style.display = 'block'; btn.innerText = "OK";
        });
      }, 500);
      break;

    case 22:
      txt.innerHTML = `これが正解なら、すべての石碑が <b>TRUE</b> になるはずだ。<br>
      最後に<b>「封印解除」</b>ボタンを押して、答え合わせをしよう！`;
      const solveBtn = document.querySelector('.solve-circle').closest('.action-btn-item');
      if(solveBtn) solveBtn.classList.add('tut-highlight', 'tut-blink');
      btn.style.display = 'none'; 
      break;
  }
}
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// ガイドを閉じる
function closeHelp() {
  document.getElementById('help-modal').style.display = 'none';
}

function closeHistory() {
  document.getElementById('history-modal').style.display = 'none';
  const tutBtn = document.getElementById('top-tut-btn');
  if(tutBtn) tutBtn.style.display = 'flex';
}

// --- ID入力モーダル制御 ---
function showInputId() {
  const tutBtn = document.getElementById('top-tut-btn');
  if(tutBtn) tutBtn.style.display = 'none';
  document.getElementById('id-modal').style.display = 'flex';
  const isUnlocked = localStorage.getItem('omega_awakened_unlocked') === 'true';
  const btn = document.getElementById('btn-id-awakened');
  if(btn) {
    btn.style.display = isUnlocked ? 'flex' : 'none';
  }
}

function closeIdModal() {
  document.getElementById('id-modal').style.display = 'none';
  const tutBtn = document.getElementById('top-tut-btn');
  if(tutBtn) tutBtn.style.display = 'flex';
}

// 封印解除の演出用
function closeConfirm() {
  document.getElementById('confirm-modal').style.display = 'none';
  if (state.isOmega) {
    const omegaArea = document.getElementById('omega-rule-area');
    if (omegaArea) {
      omegaArea.style.display = 'block';
    }
  }
}

// 2. 演出を実行してから結果画面へ
function executeUnlock() {
  document.getElementById('confirm-modal').style.display = 'none';

  const animModal = document.getElementById('gate-anim-modal');
  const gateObj = document.getElementById('gate-circle');
  const gateInner = document.querySelector('.gate-inner'); 
  
  animModal.style.display = 'flex';
  animModal.classList.add('gate-anim-running');
  
  const lightningSvg = document.querySelector('.lightning-svg');
  if (state.isOmega) {
    lightningSvg.classList.add('omega-mode'); 
  } else {
    lightningSvg.classList.remove('omega-mode'); 
  }

  gateObj.classList.remove('gate-active');
  gateObj.classList.remove('gate-active-omega'); 
  gateObj.classList.remove('gate-stone-omega');  
  gateInner.classList.remove('gate-inner-omega');

  void gateObj.offsetWidth; 

  let animTime = 2300; 

  if (state.isOmega) {
    gateObj.classList.add('gate-stone-omega');
    gateInner.classList.add('gate-inner-omega');
    gateObj.classList.add('gate-active-omega'); 
    animTime = 3800; 
  } else {
    gateObj.classList.add('gate-active');
  }

  setTimeout(() => {
    animModal.style.display = 'none';
    animModal.classList.remove('gate-anim-running');
    gateObj.classList.remove('gate-active');
    gateObj.classList.remove('gate-active-omega'); 
    
    // ★モーダル(final-1~3)の値を取得して判定する
    const uI = +document.getElementById('final-1').value;
    const uA = +document.getElementById('final-2').value;
    const uV = +document.getElementById('final-3').value;

    document.getElementById('r1').value = uI;
    document.getElementById('r2').value = uA;
    document.getElementById('r3').value = uV;

    const isCorrect = (uI === state.ans.i && uA === state.ans.a && uV === state.ans.v);
    
    finishGame(isCorrect);
    
  }, animTime); 
}

// --- 予言リストの開閉 ---
function showProphecyList() {
  document.getElementById('prophecy-list-modal').style.display = 'flex';
}
function closeProphecyList() {
  document.getElementById('prophecy-list-modal').style.display = 'none';
}


function softResetGame() {
  document.body.style.overflow = '';

  document.querySelectorAll('.modal-overlay').forEach(m => m.style.display = 'none');
  const frame = document.querySelector('.divine-frame');
  if(frame) frame.remove();
  
  document.body.style.backgroundImage = ""; 
  document.body.classList.remove('bg-tower-1', 'bg-tower-2', 'bg-tower-3', 'bg-tower-4', 'bg-tower-5');

  const manaBar = document.querySelector('.mana-bar');
  if(manaBar) {
    manaBar.style.color = "";      
    manaBar.style.textShadow = "";
    manaBar.classList.remove('glitch-active');
  }

  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('title-screen').style.display = 'flex'; 
  
  const tutBtn = document.getElementById('top-tut-btn');
  if(tutBtn) tutBtn.style.display = 'flex';
  
  const lockMsg = document.getElementById('rune-lock-msg');
  if(lockMsg) lockMsg.style.display = 'none';

  // ★修正: リセット時にロッククラスを確実に削除する
  document.querySelectorAll('.rune-wrapper').forEach(e => e.classList.remove('locked'));

  document.getElementById('r1').value = '';
  document.getElementById('r2').value = '';
  document.getElementById('r3').value = '';
  document.getElementById('r1').disabled = false;
  document.getElementById('r2').disabled = false;
  document.getElementById('r3').disabled = false;
  
  document.getElementById('log-container').innerHTML = '';
  document.getElementById('prophecy-container').innerHTML = '';
  const omegaList = document.getElementById('omega-list');
  if(omegaList) omegaList.innerHTML = ''; 
  
  const omegaArea = document.getElementById('omega-rule-area');
  if(omegaArea) omegaArea.style.display = 'none';
  
  initMatrix(); 
  const memoPad = document.getElementById('memo-pad');
  if(memoPad) memoPad.classList.add('closed');

  const chaosWarn = document.getElementById('chaos-warning');
  if(chaosWarn) {
    chaosWarn.style.display = 'none';
    chaosWarn.classList.remove('visible');
  }

  const nmWarn = document.getElementById('nightmare-warning');
  if(nmWarn) {
    nmWarn.style.display = 'none';
    nmWarn.classList.remove('visible');
  }
  
  const idDisplay = document.getElementById('current-id-display');
  if(idDisplay) idDisplay.remove();

  checkAwakenedUnlock();
}

/* --- script.js の openMenuModal 関数を置換 --- */

function openMenuModal() {
  document.getElementById('menu-modal').style.display = 'flex';
  const omegaArea = document.getElementById('omega-rule-area');
  if(omegaArea) omegaArea.style.display = 'none';

  // タワーモード用の中断ボタン制御
  const towerSaveBtn = document.getElementById('btn-tower-save');
  const normalExitBtn = document.getElementById('btn-normal-exit');
  
  // ★修正: 「タワーモード」かつ「ゲームが終了していない」場合のみ、中断セーブを許可
  if (state.currentMode === 'tower' && !state.isGameEnded) {
      if(towerSaveBtn) towerSaveBtn.style.display = 'flex';
      if(normalExitBtn) normalExitBtn.style.display = 'none';
  } else {
      // それ以外（通常モード、または既に決着がついた後）は「終了する」ボタン
      if(towerSaveBtn) towerSaveBtn.style.display = 'none';
      if(normalExitBtn) normalExitBtn.style.display = 'flex';
  }
}
function closeMenuModal() {
  document.getElementById('menu-modal').style.display = 'none';
  if(state.isOmega) {
    const omegaArea = document.getElementById('omega-rule-area');
    if(omegaArea) omegaArea.style.display = 'block';
  }
}

function executeBackToTitle() {
  closeMenuModal();
  softResetGame();
}

function quitTutorial() {
  isTutorialMode = false;
  document.querySelectorAll('.tut-highlight').forEach(e => e.classList.remove('tut-highlight'));
  document.querySelectorAll('.tut-blink').forEach(e => e.classList.remove('tut-blink'));
  
  const tutBox = document.getElementById('tut-box');
  if(tutBox) {
    tutBox.style.display = 'none';
    tutBox.classList.remove('tut-embedded-mode');
    document.body.appendChild(tutBox);
  }
  document.getElementById('tut-overlay').style.display = 'none';
  
  const matrix = document.getElementById('logic-matrix');
  if(matrix) matrix.style.display = '';
  const memoBtn = document.querySelector('.memo-toggle-btn');
  if(memoBtn) memoBtn.style.display = '';
  const memoPad = document.getElementById('memo-pad');
  if(memoPad) memoPad.style.display = '';
  const runeContainer = document.querySelector('.rune-container');
  if(runeContainer) {
      const matrixLabel = runeContainer.nextElementSibling;
      if(matrixLabel) matrixLabel.style.display = '';
  }
  softResetGame();
}

window.onload = () => { checkAwakenedUnlock(); };

function playUnlockAnimation() {
  const overlay = document.getElementById('awakened-unlock-overlay');
  if(!overlay) return;
  const resultModal = document.getElementById('result-modal');
  if(resultModal) resultModal.style.opacity = '0';

  if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

  overlay.style.display = 'flex';

  setTimeout(() => {
    overlay.style.transition = 'opacity 1s';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.display = 'none';
      overlay.style.opacity = '1'; 
      if(resultModal) {
          resultModal.style.transition = 'opacity 1s';
          resultModal.style.opacity = '1';
      }
    }, 1000);
  }, 5000);
 }
  
/* --- script.js の confirmAwakened 関数を完全に置換 --- */

function confirmAwakened() {
  // ブラウザのconfirmをやめて、専用モーダルを開く
  const modal = document.getElementById('awakened-entry-modal');
  if(modal) {
    modal.style.display = 'flex';
  }
}

// モーダルを閉じる
function closeAwakenedModal() {
  const modal = document.getElementById('awakened-entry-modal');
  if(modal) {
    modal.style.display = 'none';
  }
}

// ゲーム開始実行
function executeAwakenedStart() {
  closeAwakenedModal(); // まず突入確認モーダルを閉じる

  const overlay = document.getElementById('awakened-unlock-overlay');
  if(!overlay) {
    // 万が一オーバーレイが無い場合は即スタート
    startGame('awakened');
    return;
  }

  // 1. テキスト要素を取得
  const mainText = overlay.querySelector('.unlock-text-main');
  const subText = overlay.querySelector('.unlock-text-sub');

  // 2. 元のテキストを保存（終わったら戻すため）
  const originalMain = mainText.innerText;
  const originalSub = subText.innerText;

  // 3. 突入用のテキストに一時的に書き換え
  mainText.innerText = "深淵の扉が開かれる";
  subText.innerText = "ENTERING THE ABYSS";

  // 4. アニメーション開始（表示）
  overlay.style.display = 'flex';
  overlay.style.opacity = '1';
  
  // スマホなら振動演出
  if (navigator.vibrate) navigator.vibrate([50, 50, 100]);

  // 5. 時間差でゲーム開始
  // アニメーションをしっかり見せるため 3.5秒ほど待機
  setTimeout(() => {
    // フェードアウト開始
    overlay.style.transition = 'opacity 1s ease';
    overlay.style.opacity = '0';

    setTimeout(() => {
      // 完全に消えたら後処理
      overlay.style.display = 'none';
      overlay.style.transition = ''; // トランジションリセット
      
      // テキストを元に戻す（解放演出用に）
      mainText.innerText = originalMain;
      subText.innerText = originalSub;

      // ★ここでゲーム画面へ遷移！
      startGame('awakened');

    }, 800); // フェードアウト完了待ち(1秒)

  }, 3000); // 演出表示時間
}
let nextIconAngle = 0;
function spinNextIcon() {
  nextIconAngle += 360;
  const icon = document.querySelector('.next-circle .action-img');
  if(icon) {
    icon.style.transform = `rotate(${nextIconAngle}deg)`;
  }
}


function cycleRune(inputId, imgId, color) {
  const input = document.getElementById(inputId);
  const wrapper = input.closest('.rune-wrapper');

  // ★修正: 封印解除画面(final-*)以外で、かつロックされている場合のみリターン
  // これにより、封印解除画面では常に変更が可能になります
  if (!inputId.startsWith('final-') && wrapper.classList.contains('locked')) {
      return;
  }

  // 数字を増やす
  let val = parseInt(input.value);
  if (isNaN(val)) val = 1;
  val++;
  if (val > 5) val = 1;

  input.value = val;
  updateRuneImage(imgId, val, color);
}

// SVGで「きれいな数字画像」を作ってセットする関数
function updateRuneImage(imgId, num, color) {
  const div = document.getElementById(imgId);
  const c = color.replace('#', '%23'); // 色コード変換

  // シンプルイズベスト！ Cinzelフォントで数字を描画
  const svg = `
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50'>
    <text x='25' y='38' 
          font-family='Cinzel, serif' 
          font-weight='bold' 
          font-size='35' 
          fill='${c}' 
          text-anchor='middle' 
          style='text-shadow: 0 0 5px ${c};'>
      ${num}
    </text>
  </svg>`;

  const dataUri = `data:image/svg+xml;utf8,${svg.replace(/\n/g, '').trim()}`;
  div.style.backgroundImage = `url("${dataUri}")`;
}

// 初期表示用 (ゲーム開始時に呼ぶ)
function initRuneImages() {
  // 初期値が空なら1を入れる
  ['r1','r2','r3'].forEach((id, idx) => {
    const el = document.getElementById(id);
    if(!el.value) el.value = 1;
    const colors = ['#ff9999', '#99ccff', '#99ffcc'];
    const imgIds = ['img-r1', 'img-r2', 'img-r3'];
    updateRuneImage(imgIds[idx], el.value, colors[idx]);
  });
}

/* --- script.js の末尾（1290行目付近〜最後まで）を以下のコードで上書き --- */

// ■ 1. タワーモード用 ステート管理
let towerState = {
  active: false,
  floor: 1,
  maxFloor: 20,
  runSeed: "" // ランダムシード保持用
};

/* --- script.js の checkAwakenedUnlock をさらに安全版に更新 --- */

checkAwakenedUnlock = function() {
  // ① Awakened Omegaボタンの表示判定
  const isAwakenedAvailable = localStorage.getItem('omega_awakened_unlocked') === 'true';
  
  const btn = document.getElementById('btn-awakened');
  if(btn) btn.style.display = isAwakenedAvailable ? 'flex' : 'none';

  // ブーストボタン制御
  ['hard', 'nightmare', 'chaos', 'omega'].forEach(m => {
    const bBtn = document.getElementById(`boost-${m}`);
    if(bBtn) bBtn.style.display = isAwakenedAvailable ? 'flex' : 'none';
  });

  const spacerEasy = document.getElementById('spacer-easy');
  const spacerStd = document.getElementById('spacer-std');
  if(spacerEasy) spacerEasy.style.display = isAwakenedAvailable ? 'flex' : 'none';
  if(spacerStd) spacerStd.style.display = isAwakenedAvailable ? 'flex' : 'none';

  // --- ★安全装置: Awakened未解放なら、タワーも強制ロック ---
  if (!isAwakenedAvailable) {
      localStorage.removeItem('omega_tower_unlocked');
  }

  // ② Singularityボタンの表示判定
  const isTowerUnlocked = localStorage.getItem('omega_tower_unlocked') === 'true';
  const btnSingularity = document.getElementById('btn-singularity');
  const scoreSpan = document.getElementById('tower-best-score');
  
  if(btnSingularity) {
    btnSingularity.style.display = isTowerUnlocked ? 'flex' : 'none';
    
    if (isTowerUnlocked && scoreSpan) {
      const best = parseInt(localStorage.getItem('omega_tower_best') || "0");
      if (best >= 20) {
          scoreSpan.innerText = "COMPLETE";
          scoreSpan.style.color = "#d4af37";
          scoreSpan.style.textShadow = "0 0 5px #d4af37";
      } else if (best > 0) {
          scoreSpan.innerText = `Best: ${best}F`;
          scoreSpan.style.color = "#aaa";
          scoreSpan.style.textShadow = "none";
      } else {
          scoreSpan.innerText = "";
      }
    }
  }
};

/* --- script.js の startSingularity 関数を完全に置換 --- */

function startSingularity() {
  const modal = document.getElementById('tower-entry-modal');
  const textArea = document.getElementById('tower-modal-text');
  const btnArea = document.getElementById('tower-modal-btns');
  
  if(!modal) return;

  // 中断データの確認
  const saveStr = localStorage.getItem('omega_tower_save');
  
  if (saveStr) {
    // --- 中断データがある場合 ---
    const save = JSON.parse(saveStr);
    textArea.innerHTML = `
      <span style="color:#d4af37; font-weight:bold;">中断された記録を検知</span><br>
      Floor ${save.floor}<br><br>
      探索を再開しますか？<br>
      <span style="font-size:0.8rem; color:#888;">※「最初から」を選ぶと、中断データは破棄されます。</span>
    `;

    btnArea.innerHTML = `
      <button class="btn btn-std" style="border-color:#555; color:#aaa;" onclick="closeTowerModal()">閉じる</button>
      <button class="btn btn-hard" style="border-color:#e74c3c; color:#e74c3c;" onclick="confirmTowerStart('new')">最初から</button>
      <button class="btn btn-std" style="background:#d4af37; color:#000; border-color:#fff; font-weight:bold;" onclick="confirmTowerStart('resume', ${save.floor})">再開する</button>
    `;
  } else {
    // --- 新規スタートの場合 ---
    textArea.innerHTML = `
      これより先は引き返せない深淵<br>
      <span style="color:#9b59b6; font-weight:bold;">エンドコンテンツ</span> です。<br><br>
      全20階層。<br>
      敗北すれば、即座に1階へ戻されます。<br>
      <span style="color:#d4af37; font-size:0.9rem;">覚悟はいいですか？</span>
    `;

    btnArea.innerHTML = `
      <button class="btn btn-std" style="justify-content:center; border-color:#555; color:#aaa;" onclick="closeTowerModal()">やめる</button>
      <button class="btn btn-omega" style="justify-content:center; border-color:#d4af37; color:#fff; box-shadow:0 0 15px rgba(212,175,55,0.4);" onclick="confirmTowerStart('new')">深淵に挑む</button>
    `;
  }
  
  modal.style.display = 'flex';
}

// モーダルを閉じる関数
function closeTowerModal() {
  document.getElementById('tower-entry-modal').style.display = 'none';
}

// 選択後の処理
/* --- script.js の confirmTowerStart を修正 --- */
function confirmTowerStart(type, floor) {
  closeTowerModal();
  
  // ゲーム開始処理を関数化
  const runGame = () => {
    if (type === 'resume') {
       const saveStr = localStorage.getItem('omega_tower_save');
       if(saveStr) {
         const save = JSON.parse(saveStr);
         towerState.floor = save.floor;
         towerState.runSeed = save.runSeed || generateSeed(5);
         startTowerLevel(save.floor);
       }
    } else {
       // 新規スタート
       localStorage.removeItem('omega_tower_save');
       towerState.floor = 1;
       towerState.runSeed = generateSeed(5);
       startTowerLevel(1);
    }
  };

  // ★ここでアニメーションを挟む
  // 新規(1階)ならタワー突入演出、再開ならいきなり開始（または階段でもOK）
  // ここでは「突入演出」を再生
  playTowerEntryAnim(runGame);
}

// ■ 4. 階層開始ラッパー
function startTowerLevel(floor) {
   // 1. 前の階層のデータを物理的に消去
   // これで「前の問題」が残る可能性はゼロになります
   const pContainer = document.getElementById('prophecy-container');
   if (pContainer) pContainer.innerHTML = '';
   
   const lContainer = document.getElementById('log-container');
   if (lContainer) lContainer.innerHTML = '';
   
   // 2. 状態更新
   towerState.active = true;
   towerState.floor = floor;
   const seedPrefix = `T-${towerState.runSeed}-F${floor}`;
   
   // 3. 次の階層を生成
   // 階段で隠れている間に実行されるので、ユーザーには見えません
   initGame('tower', seedPrefix); 

   // 4. スクロール位置をリセット
   // これも裏側でこっそりやっておきます
   setTimeout(() => {
       window.scrollTo(0, 0);
       document.documentElement.scrollTop = 0;
       document.body.scrollTop = 0;
   }, 10);
   
   // ※画面の透明度操作やフェードイン処理は削除しました。
   // 階段オーバーレイが消えた瞬間、そこには既に完成した新しい階層があります。
}

// ■ 5. 中断セーブ実行
function executeTowerSave() {
  if (state.currentMode === 'tower') {
      // 階層だけでなく、ランダムシードも保存する
      localStorage.setItem('omega_tower_save', JSON.stringify({ 
          floor: towerState.floor,
          runSeed: towerState.runSeed
      }));
      alert(`Floor ${towerState.floor} の状態で記録しました。\nタイトルへ戻ります。`);
  }
  closeMenuModal();
  softResetGame();
}

// ■ 6. タワー用UI更新ヘルパー
function updateTowerUI(floor) {
   // 背景リセット & クラス付与
   document.body.classList.remove('bg-tower-1', 'bg-tower-2', 'bg-tower-3', 'bg-tower-4', 'bg-tower-5');
   
   if(floor <= 5) document.body.classList.add('bg-tower-1');
   else if(floor <= 10) document.body.classList.add('bg-tower-2');
   else if(floor <= 15) document.body.classList.add('bg-tower-3');
   else if(floor <= 19) document.body.classList.add('bg-tower-4');
   else document.body.classList.add('bg-tower-5');

   // ID表示エリアを「FLOOR表示」に書き換え
   const idDisplay = document.getElementById('current-id-display');
   if(idDisplay) {
     idDisplay.innerHTML = `<div id="tower-floor-badge">FLOOR ${floor}</div>`;
   }
}

/* --- script.js タワー演出関数 (画像版・修正) --- */
function playTowerUnlockAnimation() {
  const overlay = document.getElementById('tower-unlock-overlay');
  const resultModal = document.getElementById('result-modal');
  const towerContainer = document.querySelector('.tower-image-container');
  const textContainer = document.querySelector('.tower-unlock-container');

  if(!overlay) return;

  // 1. リセット処理
  if(towerContainer) {
    towerContainer.classList.remove('rise-active');
    towerContainer.style.transform = 'translateY(100%)'; // 強制的に下へ
  }
  if(textContainer) textContainer.classList.remove('text-visible');

  // 結果画面を隠す
  if(resultModal) resultModal.style.opacity = '0';
  // スクロール禁止
  document.body.style.overflow = 'hidden';

  // 2. オーバーレイを表示 (Flexboxとして表示)
  overlay.style.display = 'flex'; // ★ここ重要
  
  // ブラウザに描画を確定させる（強制リフロー）
  void overlay.offsetWidth; 
  
  // フェードイン
  overlay.style.opacity = '1';
  document.body.classList.add('shake-effect');
  
  if (navigator.vibrate) navigator.vibrate([200, 50, 200, 50, 1000]);

  // 3. アニメーション開始 (少し待つ)
  setTimeout(() => {
    if(towerContainer) {
      towerContainer.classList.add('rise-active');
      towerContainer.style.transform = ''; // CSS transitionに任せる
    }
    if(textContainer) textContainer.classList.add('text-visible');
  }, 100);

  // 4. 終了処理 (8秒後)
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      document.body.classList.remove('shake-effect');
      document.body.style.overflow = ''; 
      
      overlay.style.display = 'none';
      if(towerContainer) {
        towerContainer.classList.remove('rise-active');
        towerContainer.style.transform = 'translateY(100%)';
      }
      if(textContainer) textContainer.classList.remove('text-visible');
      if(resultModal) resultModal.style.opacity = '1';
      
    }, 1000);
  }, 8000);
}

// ★強制勝利コマンド（コピーしてコンソールで実行）
function debugWin() {
  document.getElementById('r1').value = state.ans.i;
  document.getElementById('r2').value = state.ans.a;
  document.getElementById('r3').value = state.ans.v;
  finishGame(true);
}

// --- 演出用関数 ---

// 1. タワー突入演出
// callbackには「ゲーム生成処理」が入ります
function playTowerEntryAnim(callback) {
  const overlay = document.getElementById('tower-entry-anim-overlay');
  const img = document.getElementById('anim-tower-img');
  
  if(!overlay || !img) {
    if(callback) callback();
    return;
  }

  // 準備: 画面を黒くし、画像を表示
  overlay.style.display = 'flex';
  overlay.style.opacity = '1'; 
  overlay.style.transition = 'none'; // 即座に不透明にする
  // ★追加1：雷エフェクトのスイッチをリセット
  overlay.classList.remove('overlay-active');

  img.style.transform = 'scale(1)';
  img.style.opacity = '1';
  img.style.transition = 'transform 2.5s cubic-bezier(0.7, 0, 0.3, 1), opacity 2.5s ease-in';
  img.classList.remove('tower-zoom-active');

  // 少し待ってから拡大開始
  setTimeout(() => {
    img.classList.add('tower-zoom-active');
    // ★追加2：ここで雷のスイッチON！
    overlay.classList.add('overlay-active');
  }, 50);

  // アニメーション終了のタイミング
  setTimeout(() => {
    // ★ここが修正点: 
    // オーバーレイ(黒背景)は消さずに、callback(ゲーム生成)を実行する！
    // 画面は真っ暗なまま、裏でゲームが作られます。
    
    if(callback) callback();
    setTimeout(() => {
       overlay.classList.remove('overlay-active');
    }, 1000);

  }, 2000); // 拡大アニメーションが終わる頃に実行
}

/* script.js の playStairsAnim 関数をこれに置換 */

function playStairsAnim(callback) {
  const overlay = document.getElementById('stairs-anim-overlay');
  
  if(!overlay) {
    if(callback) callback();
    return;
  }

  // 1. 準備
  overlay.style.display = 'block';
  overlay.classList.remove('stairs-climb-active');
  void overlay.offsetWidth; // リフロー

  // 2. アニメーション開始（2.5秒かけて登る演出）
  overlay.classList.add('stairs-climb-active');

  // ★変更点: 画面が完全に隠れたタイミング（0.5秒後）で、裏で次の階層を作る！
  setTimeout(() => {
    // ここで次の階層の生成（startTowerLevel）を実行します。
    // 画面は階段の画像で隠れているので、裏で何をしてもバレません。
    if(callback) callback();
    
  }, 500); // 0.5秒後に実行

  // 3. 終了処理
  setTimeout(() => {
    // 階段の演出が終わる頃（2.4秒後）には、裏の準備は完璧に終わっているはずです。
    // そのままオーバーレイを消せば、新しい階層が「ジャン！」と現れます。
    overlay.style.display = 'none';
  }, 2400); 
}