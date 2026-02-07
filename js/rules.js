/* diff: 1 -> 簡単 (単一の値、単純な偶奇)
  diff: 2 -> 普通 (2つの比較、単純な合計)
  diff: 3 -> 難しい (3つの関係、複雑な条件、否定形)
*/
const POOL = [
  { name:"炎の偶奇 (偶数, 奇数)", desc:"炎 = 偶数", f:(i,a,v)=>i%2==0, diff:1 }, 
  { name:"炎の偶奇 (偶数, 奇数)", desc:"炎 = 奇数", f:(i,a,v)=>i%2!=0, diff:1 }, 
  { name:"水の偶奇 (偶数, 奇数)", desc:"水 = 偶数", f:(i,a,v)=>a%2==0, diff:1 }, 
  { name:"水の偶奇 (偶数, 奇数)", desc:"水 = 奇数", f:(i,a,v)=>a%2!=0 , diff:1}, 
  { name:"風の偶奇 (偶数, 奇数)", desc:"風 = 偶数", f:(i,a,v)=>v%2==0 , diff:1}, 
  { name:"風の偶奇 (偶数, 奇数)", desc:"風 = 奇数", f:(i,a,v)=>v%2!=0 , diff:1},

    // 炎・水・風と1〜5の関係（<, =, >）
  { name:"炎と1の関係 ( =, >)", desc:"炎 = 1", f:(i,a,v)=>i==1 , diff:1},
  { name:"炎と1の関係 ( =, >)", desc:"炎 > 1", f:(i,a,v)=>i>1 , diff:1},
  { name:"水と1の関係 ( =, >)", desc:"水 = 1", f:(i,a,v)=>a==1, diff:1 },
  { name:"水と1の関係 ( =, >)", desc:"水 > 1", f:(i,a,v)=>a>1 , diff:1},
  { name:"風と1の関係 ( =, >)", desc:"風 = 1", f:(i,a,v)=>v==1, diff:1 },
  { name:"風と1の関係 ( =, >)", desc:"風 > 1", f:(i,a,v)=>v>1, diff:1 },
  
  { name:"炎と2の関係 (<, =, >)", desc:"炎 = 2", f:(i,a,v)=>i==2, diff:1 },
  { name:"炎と2の関係 (<, =, >)", desc:"炎 > 2", f:(i,a,v)=>i>2 , diff:1},
  { name:"炎と2の関係 (<, =, >)", desc:"炎 < 2", f:(i,a,v)=>i<2 , diff:1},
  { name:"水と2の関係 (<, =, >)", desc:"水 = 2", f:(i,a,v)=>a==2, diff:1 },
  { name:"水と2の関係 (<, =, >)", desc:"水 > 2", f:(i,a,v)=>a>2, diff:1 },
  { name:"水と2の関係 (<, =, >)", desc:"水 < 2", f:(i,a,v)=>a<2 , diff:1},
  { name:"風と2の関係 (<, =, >)", desc:"風 = 2", f:(i,a,v)=>v==2, diff:1 },
  { name:"風と2の関係 (<, =, >)", desc:"風 > 2", f:(i,a,v)=>v>2, diff:1 },
  { name:"風と2の関係 (<, =, >)", desc:"風 < 2", f:(i,a,v)=>v<2, diff:1 },

  { name:"炎と3の関係 (<, =, >)", desc:"炎 = 3", f:(i,a,v)=>i==3 , diff:1},
  { name:"炎と3の関係 (<, =, >)", desc:"炎 > 3", f:(i,a,v)=>i>3, diff:1 },
  { name:"炎と3の関係 (<, =, >)", desc:"炎 < 3", f:(i,a,v)=>i<3, diff:1 },
  { name:"水と3の関係 (<, =, >)", desc:"水 = 3", f:(i,a,v)=>a==3, diff:1 },
  { name:"水と3の関係 (<, =, >)", desc:"水 > 3", f:(i,a,v)=>a>3 , diff:1},
  { name:"水と3の関係 (<, =, >)", desc:"水 < 3", f:(i,a,v)=>a<3 , diff:1},
  { name:"風と3の関係 (<, =, >)", desc:"風 = 3", f:(i,a,v)=>v==3 , diff:1},
  { name:"風と3の関係 (<, =, >)", desc:"風 > 3", f:(i,a,v)=>v>3 , diff:1},
  { name:"風と3の関係 (<, =, >)", desc:"風 < 3", f:(i,a,v)=>v<3 , diff:1},

  { name:"炎と4の関係 (<, =, >)", desc:"炎 = 4", f:(i,a,v)=>i==4 , diff:1},
  { name:"炎と4の関係 (<, =, >)", desc:"炎 > 4", f:(i,a,v)=>i>4 , diff:1},
  { name:"炎と4の関係 (<, =, >)", desc:"炎 < 4", f:(i,a,v)=>i<4 , diff:1},
  { name:"水と4の関係 (<, =, >)", desc:"水 = 4", f:(i,a,v)=>a==4, diff:1 },
  { name:"水と4の関係 (<, =, >)", desc:"水 > 4", f:(i,a,v)=>a>4 , diff:1},
  { name:"水と4の関係 (<, =, >)", desc:"水 < 4", f:(i,a,v)=>a<4 , diff:1},
  { name:"風と4の関係 (<, =, >)", desc:"風 = 4", f:(i,a,v)=>v==4 , diff:1},
  { name:"風と4の関係 (<, =, >)", desc:"風 > 4", f:(i,a,v)=>v>4 , diff:1},
  { name:"風と4の関係 (<, =, >)", desc:"風 < 4", f:(i,a,v)=>v<4 , diff:1},

  { name:"炎と5の関係 (<, = )", desc:"炎 = 5", f:(i,a,v)=>i==5 , diff:1},
  { name:"炎と5の関係 (<, = )", desc:"炎 < 5", f:(i,a,v)=>i<5 , diff:1},
  { name:"水と5の関係 (<, = )", desc:"水 = 5", f:(i,a,v)=>a==5, diff:1 },
  { name:"水と5の関係 (<, = )", desc:"水 < 5", f:(i,a,v)=>a<5 , diff:1},
  { name:"風と5の関係 (<, = )", desc:"風 = 5", f:(i,a,v)=>v==5, diff:1 },
  { name:"風と5の関係 (<, = )", desc:"風 < 5", f:(i,a,v)=>v<5, diff:1 },

  { name:"炎と水の比較 (<, =, >)", desc:"炎 > 水", f:(i,a,v)=>i>a, diff:2 }, 
  { name:"炎と水の比較 (<, =, >)", desc:"炎 < 水", f:(i,a,v)=>i<a, diff:2 }, 
  { name:"炎と水の比較 (<, =, >)", desc:"炎 = 水", f:(i,a,v)=>i==a, diff:2 },
  { name:"水と風の比較 (<, =, >)", desc:"水 > 風", f:(i,a,v)=>a>v , diff:2}, 
  { name:"水と風の比較 (<, =, >)", desc:"水 < 風", f:(i,a,v)=>a<v , diff:2}, 
  { name:"水と風の比較 (<, =, >)", desc:"水 = 風", f:(i,a,v)=>a==v , diff:2},
  { name:"炎と風の比較 (<, =, >)", desc:"炎 > 風", f:(i,a,v)=>i>v, diff:2 }, 
  { name:"炎と風の比較 (<, =, >)", desc:"炎 < 風", f:(i,a,v)=>i<v , diff:2}, 
  { name:"炎と風の比較 (<, =, >)", desc:"炎 = 風", f:(i,a,v)=>i==v, diff:2 },

  { name:"最大値の所在(同数の可能性含む) (≧)", desc:"炎が最大 (他以上)", f:(i,a,v)=>i>=a && i>=v, diff:2 }, 
  { name:"最大値の所在(同数の可能性含む) (≧)", desc:"水が最大 (他以上)", f:(i,a,v)=>a>=i && a>=v , diff:2}, 
  { name:"最大値の所在(同数の可能性含む) (≧)", desc:"風が最大 (他以上)", f:(i,a,v)=>v>=i && v>=a, diff:2 }, 
  { name:"最小値の所在(同数の可能性含む) (≦)", desc:"炎が最小 (他以下)", f:(i,a,v)=>i<=a && i<=v, diff:2 }, 
  { name:"最小値の所在(同数の可能性含む) (≦)", desc:"水が最小 (他以下)", f:(i,a,v)=>a<=i && a<=v, diff:2 }, 
  { name:"最小値の所在(同数の可能性含む) (≦)", desc:"風が最小 (他以下)", f:(i,a,v)=>v<=i && v<=a , diff:2}, 

  { name:"合計の偶奇 (偶数, 奇数)", desc:"合計 = 偶数", f:(i,a,v)=>(i+a+v)%2==0 , diff:2},
  { name:"合計の偶奇 (偶数, 奇数)", desc:"合計 = 奇数", f:(i,a,v)=>(i+a+v)%2!=0 , diff:2},
  { name:"合計と6の関係 (<, ≧)", desc:"合計 < 6", f:(i,a,v)=>(i+a+v)<6 , diff:2},
  { name:"合計と6の関係 (<, ≧)", desc:"合計 ≧ 6", f:(i,a,v)=>(i+a+v)>=6 , diff:2},
  { name:"合計と10の関係 (<, ≧)", desc:"合計 < 10", f:(i,a,v)=>(i+a+v)<10 , diff:2},
  { name:"合計と10の関係 (<, ≧)", desc:"合計 ≧ 10", f:(i,a,v)=>(i+a+v)>=10, diff:2 },

  { name:"素数の有無 (あり, なし)", desc:"素数を含む", f:(i,a,v)=>[i,a,v].some(n=>[2,3,5].includes(n)), diff:2 },
  { name:"素数の有無 (あり, なし)", desc:"素数を含まない", f:(i,a,v)=>![i,a,v].some(n=>[2,3,5].includes(n)), diff:2 },

  { name:"炎+水と5の関係 (<, =, >)", desc:"炎+水 > 5", f:(i,a,v)=>(i+a)>5 , diff:3},
  { name:"炎+水と5の関係 (<, =, >)", desc:"炎+水 < 5", f:(i,a,v)=>(i+a)<5  , diff:3},
  { name:"炎+水と5の関係 (<, =, >)", desc:"炎+水 = 5", f:(i,a,v)=>(i+a)==5  , diff:3},
  { name:"水+風と5の関係 (<, =, >)", desc:"水+風 > 5", f:(i,a,v)=>(a+v)>5 , diff:3 },
  { name:"水+風と5の関係 (<, =, >)", desc:"水+風 < 5", f:(i,a,v)=>(a+v)<5  , diff:3},
  { name:"水+風と5の関係 (<, =, >)", desc:"水+風 = 5", f:(i,a,v)=>(a+v)==5 , diff:3 },
  { name:"炎+風と5の関係 (<, =, >)", desc:"炎+風 > 5", f:(i,a,v)=>(i+v)>5  , diff:3},
  { name:"炎+風と5の関係 (<, =, >)", desc:"炎+風 < 5", f:(i,a,v)=>(i+v)<5  , diff:3},
  { name:"炎+風と5の関係 (<, =, >)", desc:"炎+風 = 5", f:(i,a,v)=>(i+v)==5  , diff:3},

  { name:"偶数の数 (0, 1, 2)", desc:"偶数が0個", f:(i,a,v)=>[i,a,v].filter(n=>n%2==0).length==0  , diff:3},
  { name:"偶数の数 (0, 1, 2)", desc:"偶数が1個", f:(i,a,v)=>[i,a,v].filter(n=>n%2==0).length==1 , diff:3 },
  { name:"偶数の数 (0, 1, 2)", desc:"偶数が2個", f:(i,a,v)=>[i,a,v].filter(n=>n%2==0).length==2 , diff:3 },
  { name:"1の数 (0, 1, 2, 3)", desc:"1を含まない", f:(i,a,v)=>[i,a,v].filter(n=>n==1).length==0  , diff:3},
  { name:"1の数 (0, 1, 2, 3)", desc:"1が1個", f:(i,a,v)=>[i,a,v].filter(n=>n==1).length==1  , diff:3},
  { name:"1の数 (0, 1, 2, 3)", desc:"1が2個", f:(i,a,v)=>[i,a,v].filter(n=>n==1).length==2 , diff:3 },
  { name:"1の数 (0, 1, 2, 3)", desc:"1が3個", f:(i,a,v)=>[i,a,v].filter(n=>n==1).length==3 , diff:3 },
  { name:"3の数 (0, 1, 2, 3)", desc:"3を含まない", f:(i,a,v)=>[i,a,v].filter(n=>n==3).length==0 , diff:3 },
  { name:"3の数 (0, 1, 2, 3)", desc:"3が1個", f:(i,a,v)=>[i,a,v].filter(n=>n==3).length==1  , diff:3},
  { name:"3の数 (0, 1, 2, 3)", desc:"3が2個", f:(i,a,v)=>[i,a,v].filter(n=>n==3).length==2 , diff:3 },
  { name:"3の数 (0, 1, 2, 3)", desc:"3が3個", f:(i,a,v)=>[i,a,v].filter(n=>n==3).length==3  , diff:3},
  
  
  { name:"順序の法則 (昇順, 降順, 順不同)", desc:"昇順 (炎 < 水 < 風)", f:(i,a,v)=> (i < a && a < v)  , diff:3},
  { name:"順序の法則 (昇順, 降順, 順不同)", desc:"降順 (炎 > 水 > 風)", f:(i,a,v)=> (i > a && a > v)  , diff:3},
  { name:"順序の法則 (昇順, 降順, 順不同)", desc:"順不同 (バラバラ)", f:(i,a,v)=> !((i < a && a < v) || (i > a && a > v))  , diff:3},


  { name:"隣接する連番の数(0 , 1 , 2)", desc:"隣接する連番の数(0箇所)", f:(i,a,v)=> {
      let c = 0;
      if(Math.abs(i-a) === 1) c++;
      if(Math.abs(a-v) === 1) c++;
      return c === 0;
  } , diff:3},
  { name:"隣接する連番の数(0 , 1 , 2)", desc:"隣接する連番の数(1箇所)", f:(i,a,v)=> {
      let c = 0;
      if(Math.abs(i-a) === 1) c++;
      if(Math.abs(a-v) === 1) c++;
      return c === 1;
  } , diff:3},
  { name:"隣接する連番の数(0 , 1 , 2)", desc:"隣接する連番の数(完全連結)", f:(i,a,v)=> {
      let c = 0;
      if(Math.abs(i-a) === 1) c++;
      if(Math.abs(a-v) === 1) c++;
      return c === 2;
  } , diff:3},
  { name:"2つの同じ数字 (なし, 1組)", desc:"2つの同じ数字はない (すべて異なる)", f:(i,a,v)=> (i!=a && a!=v && i!=v) },
  { name:"2つの同じ数字 (なし, 1組)", desc:"同じ数字が含まれる (ペア or トリオ)", f:(i,a,v)=> {
      return (i===a || a===v || i===v);
  } , diff:3},
  { name:"最大と最小の差(0 ,1 ,2 ,3 ,4)", desc:"最大と最小の差が 0 (すべて同じ)", f:(i,a,v)=> (Math.max(i,a,v) - Math.min(i,a,v)) === 0 , diff:3 },
  { name:"最大と最小の差(0 ,1 ,2 ,3 ,4)", desc:"最大と最小の差が 1 ", f:(i,a,v)=> (Math.max(i,a,v) - Math.min(i,a,v)) === 1 , diff:3 },
  { name:"最大と最小の差(0 ,1 ,2 ,3 ,4)", desc:"最大と最小の差が 2 ", f:(i,a,v)=> (Math.max(i,a,v) - Math.min(i,a,v)) === 2 , diff:3 },
  { name:"最大と最小の差(0 ,1 ,2 ,3 ,4)", desc:"最大と最小の差が 3 ", f:(i,a,v)=> (Math.max(i,a,v) - Math.min(i,a,v)) === 3 , diff:3 },
  { name:"最大と最小の差(0 ,1 ,2 ,3 ,4)", desc:"最大と最小の差が 4 ", f:(i,a,v)=> (Math.max(i,a,v) - Math.min(i,a,v)) === 4 , diff:3 },

  { name:"合計が特定の倍数(2, 3, 5)", desc:"合計が 2の倍数 ", f:(i,a,v)=> (i+a+v)%2 === 0 , diff:3 },
  { name:"合計が特定の倍数(2, 3, 5)", desc:"合計が 3の倍数", f:(i,a,v)=> (i+a+v)%3 === 0  , diff:3},
  { name:"合計が特定の倍数(2, 3, 5)", desc:"合計が 5の倍数", f:(i,a,v)=> (i+a+v)%5 === 0 , diff:3 },

  { name:"合計値が素数かどうか", desc:"合計が素数 (3,5,7,11,13)", f:(i,a,v)=> {
      const sum = i+a+v;
      return [3, 5, 7, 11, 13].includes(sum);
  } , diff:3},
  { name:"合計値が素数かどうか", desc:"合計が素数ではない", f:(i,a,v)=> {
      const sum = i+a+v;
      return ![3, 5, 7, 11, 13].includes(sum);
  } , diff:3},
  // --- ★追加: Diff 4 (Awakened Mode用) ---

  //  1 or 3の個数
  { name:"1か3の数 (0, 1, 2, 3)", desc:"1が0個", f:(i,a,v)=>[i,a,v].filter(n=>n==1).length==0, diff:4 },
  { name:"1か3の数 (0, 1, 2, 3)", desc:"1が1個", f:(i,a,v)=>[i,a,v].filter(n=>n==1).length==1, diff:4 },
  { name:"1か3の数 (0, 1, 2, 3)", desc:"1が2個", f:(i,a,v)=>[i,a,v].filter(n=>n==1).length==2, diff:4 },
  { name:"1か3の数 (0, 1, 2, 3)", desc:"1が3個", f:(i,a,v)=>[i,a,v].filter(n=>n==1).length==3, diff:4 },
  { name:"1か3の数 (0, 1, 2, 3)", desc:"3が0個", f:(i,a,v)=>[i,a,v].filter(n=>n==3).length==0, diff:4 },
  { name:"1か3の数 (0, 1, 2, 3)", desc:"3が1個", f:(i,a,v)=>[i,a,v].filter(n=>n==3).length==1, diff:4 },
  { name:"1か3の数 (0, 1, 2, 3)", desc:"3が2個", f:(i,a,v)=>[i,a,v].filter(n=>n==3).length==2, diff:4 },
  { name:"1か3の数 (0, 1, 2, 3)", desc:"3が3個", f:(i,a,v)=>[i,a,v].filter(n=>n==3).length==3, diff:4 },

  //  2 or 4の個数
  { name:"2か4の数 (0, 1, 2, 3)", desc:"2が0個", f:(i,a,v)=>[i,a,v].filter(n=>n==2).length==0, diff:4 },
  { name:"2か4の数 (0, 1, 2, 3)", desc:"2が1個", f:(i,a,v)=>[i,a,v].filter(n=>n==2).length==1, diff:4 },
  { name:"2か4の数 (0, 1, 2, 3)", desc:"2が2個", f:(i,a,v)=>[i,a,v].filter(n=>n==2).length==2, diff:4 },
  { name:"2か4の数 (0, 1, 2, 3)", desc:"2が3個", f:(i,a,v)=>[i,a,v].filter(n=>n==2).length==3, diff:4 },
  { name:"2か4の数 (0, 1, 2, 3)", desc:"4が0個", f:(i,a,v)=>[i,a,v].filter(n=>n==4).length==0, diff:4 },
  { name:"2か4の数 (0, 1, 2, 3)", desc:"4が1個", f:(i,a,v)=>[i,a,v].filter(n=>n==4).length==1, diff:4 },
  { name:"2か4の数 (0, 1, 2, 3)", desc:"4が2個", f:(i,a,v)=>[i,a,v].filter(n=>n==4).length==2, diff:4 },
  { name:"2か4の数 (0, 1, 2, 3)", desc:"4が3個", f:(i,a,v)=>[i,a,v].filter(n=>n==4).length==3, diff:4 },

  //  3 or 4の個数
  { name:"3か4の数 (0, 1, 2, 3)", desc:"3が0個", f:(i,a,v)=>[i,a,v].filter(n=>n==3).length==0, diff:4 },
  { name:"3か4の数 (0, 1, 2, 3)", desc:"3が1個", f:(i,a,v)=>[i,a,v].filter(n=>n==3).length==1, diff:4 },
  { name:"3か4の数 (0, 1, 2, 3)", desc:"3が2個", f:(i,a,v)=>[i,a,v].filter(n=>n==3).length==2, diff:4 },
  { name:"3か4の数 (0, 1, 2, 3)", desc:"3が3個", f:(i,a,v)=>[i,a,v].filter(n=>n==3).length==3, diff:4 },
  { name:"3か4の数 (0, 1, 2, 3)", desc:"4が0個", f:(i,a,v)=>[i,a,v].filter(n=>n==4).length==0, diff:4 },
  { name:"3か4の数 (0, 1, 2, 3)", desc:"4が1個", f:(i,a,v)=>[i,a,v].filter(n=>n==4).length==1, diff:4 },
  { name:"3か4の数 (0, 1, 2, 3)", desc:"4が2個", f:(i,a,v)=>[i,a,v].filter(n=>n==4).length==2, diff:4 },
  { name:"3か4の数 (0, 1, 2, 3)", desc:"4が3個", f:(i,a,v)=>[i,a,v].filter(n=>n==4).length==3, diff:4 },

  //  2 or 5の個数
  { name:"2か5の数 (0, 1, 2, 3)", desc:"2が0個", f:(i,a,v)=>[i,a,v].filter(n=>n==2).length==0, diff:4 },
  { name:"2か5の数 (0, 1, 2, 3)", desc:"2が1個", f:(i,a,v)=>[i,a,v].filter(n=>n==2).length==1, diff:4 },
  { name:"2か5の数 (0, 1, 2, 3)", desc:"2が2個", f:(i,a,v)=>[i,a,v].filter(n=>n==2).length==2, diff:4 },
  { name:"2か5の数 (0, 1, 2, 3)", desc:"2が3個", f:(i,a,v)=>[i,a,v].filter(n=>n==2).length==3, diff:4 },
  { name:"2か5の数 (0, 1, 2, 3)", desc:"5が0個", f:(i,a,v)=>[i,a,v].filter(n=>n==5).length==0, diff:4 },
  { name:"2か5の数 (0, 1, 2, 3)", desc:"5が1個", f:(i,a,v)=>[i,a,v].filter(n=>n==5).length==1, diff:4 },
  { name:"2か5の数 (0, 1, 2, 3)", desc:"5が2個", f:(i,a,v)=>[i,a,v].filter(n=>n==5).length==2, diff:4 },
  { name:"2か5の数 (0, 1, 2, 3)", desc:"5が3個", f:(i,a,v)=>[i,a,v].filter(n=>n==5).length==3, diff:4 },

  //  唯一の最大値・最小値 (Strict inequality)
  { name:"唯一の最大か唯一の最小の所在\n（判定値を複数入れるとFalse）", desc:"炎が唯一の最大 (他より大きい)", f:(i,a,v)=> i > a && i > v, diff:4 },
  { name:"唯一の最大か唯一の最小の所在\n（判定値を複数入れるとFalse）", desc:"水が唯一の最大 (他より大きい)", f:(i,a,v)=> a > i && a > v, diff:4 },
  { name:"唯一の最大か唯一の最小の所在\n（判定値を複数入れるとFalse）", desc:"風が唯一の最大 (他より大きい)", f:(i,a,v)=> v > i && v > a, diff:4 },
  { name:"唯一の最大か唯一の最小の所在\n（判定値を複数入れるとFalse）", desc:"炎が唯一の最小 (他より小さい)", f:(i,a,v)=> i < a && i < v, diff:4 },
  { name:"唯一の最大か唯一の最小の所在\n（判定値を複数入れるとFalse）", desc:"水が唯一の最小 (他より小さい)", f:(i,a,v)=> a < i && a < v, diff:4 },
  { name:"唯一の最大か唯一の最小の所在\n（判定値を複数入れるとFalse）", desc:"風が唯一の最小 (他より小さい)", f:(i,a,v)=> v < i && v < a, diff:4 },

  //  属性同士の比較 (Diff4枠として再定義)
  // 炎 vs 水
  { name:"炎と特定の属性の比較 (<, =, >)", desc:"炎 > 水", f:(i,a,v)=> i > a, diff:4 },
  { name:"炎と特定の属性の比較 (<, =, >)", desc:"炎 = 水", f:(i,a,v)=> i == a, diff:4 },
  { name:"炎と特定の属性の比較 (<, =, >)", desc:"炎 < 水", f:(i,a,v)=> i < a, diff:4 },
  // 炎 vs 風
  { name:"炎と特定の属性の比較 (<, =, >)", desc:"炎 > 風", f:(i,a,v)=> i > v, diff:4 },
  { name:"炎と特定の属性の比較 (<, =, >)", desc:"炎 = 風", f:(i,a,v)=> i == v, diff:4 },
  { name:"炎と特定の属性の比較 (<, =, >)", desc:"炎 < 風", f:(i,a,v)=> i < v, diff:4 },
  // 水 vs 炎
  { name:"水と特定の属性の比較 (<, =, >)", desc:"水 > 炎", f:(i,a,v)=> a > i, diff:4 },
  { name:"水と特定の属性の比較 (<, =, >)", desc:"水 = 炎", f:(i,a,v)=> a == i, diff:4 },
  { name:"水と特定の属性の比較 (<, =, >)", desc:"水 < 炎", f:(i,a,v)=> a < i, diff:4 },
  // 水 vs 風
  { name:"水と特定の属性の比較 (<, =, >)", desc:"水 > 風", f:(i,a,v)=> a > v, diff:4 },
  { name:"水と特定の属性の比較 (<, =, >)", desc:"水 = 風", f:(i,a,v)=> a == v, diff:4 },
  { name:"水と特定の属性の比較 (<, =, >)", desc:"水 < 風", f:(i,a,v)=> a < v, diff:4 },
  // 風 vs 炎
  { name:"風と特定の属性の比較 (<, =, >)", desc:"風 > 炎", f:(i,a,v)=> v > i, diff:4 },
  { name:"風と特定の属性の比較 (<, =, >)", desc:"風 = 炎", f:(i,a,v)=> v == i, diff:4 },
  { name:"風と特定の属性の比較 (<, =, >)", desc:"風 < 炎", f:(i,a,v)=> v < i, diff:4 },
  // 風 vs 水
  { name:"風と特定の属性の比較 (<, =, >)", desc:"風 > 水", f:(i,a,v)=> v > a, diff:4 },
  { name:"風と特定の属性の比較 (<, =, >)", desc:"風 = 水", f:(i,a,v)=> v == a, diff:4 },
  { name:"風と特定の属性の比較 (<, =, >)", desc:"風 < 水", f:(i,a,v)=> v < a, diff:4 },

  // 2と特定の属性の比較
  { name:"2と特定の属性の比較 (<, =, >)", desc:"2 > 炎", f:(i,a,v)=> 2 > i, diff:4 },
  { name:"2と特定の属性の比較 (<, =, >)", desc:"2 = 炎", f:(i,a,v)=> 2 == i, diff:4 },
  { name:"2と特定の属性の比較 (<, =, >)", desc:"2 < 炎", f:(i,a,v)=> 2 < i, diff:4 },
  { name:"2と特定の属性の比較 (<, =, >)", desc:"2 > 水", f:(i,a,v)=> 2 > a, diff:4 },
  { name:"2と特定の属性の比較 (<, =, >)", desc:"2 = 水", f:(i,a,v)=> 2 == a, diff:4 },
  { name:"2と特定の属性の比較 (<, =, >)", desc:"2 < 水", f:(i,a,v)=> 2 < a, diff:4 },
  { name:"2と特定の属性の比較 (<, =, >)", desc:"2 > 風", f:(i,a,v)=> 2 > v, diff:4 },
  { name:"2と特定の属性の比較 (<, =, >)", desc:"2 = 風", f:(i,a,v)=> 2 == v, diff:4 },
  { name:"2と特定の属性の比較 (<, =, >)", desc:"2 < 風", f:(i,a,v)=> 2 < v, diff:4 },

  // 3と特定の属性の比較
  { name:"3と特定の属性の比較 (<, =, >)", desc:"3 > 炎", f:(i,a,v)=> 3 > i, diff:4 },
  { name:"3と特定の属性の比較 (<, =, >)", desc:"3 = 炎", f:(i,a,v)=> 3 == i, diff:4 },
  { name:"3と特定の属性の比較 (<, =, >)", desc:"3 < 炎", f:(i,a,v)=> 3 < i, diff:4 },
  { name:"3と特定の属性の比較 (<, =, >)", desc:"3 > 水", f:(i,a,v)=> 3 > a, diff:4 },
  { name:"3と特定の属性の比較 (<, =, >)", desc:"3 = 水", f:(i,a,v)=> 3 == a, diff:4 },
  { name:"3と特定の属性の比較 (<, =, >)", desc:"3 < 水", f:(i,a,v)=> 3 < a, diff:4 },
  { name:"3と特定の属性の比較 (<, =, >)", desc:"3 > 風", f:(i,a,v)=> 3 > v, diff:4 },
  { name:"3と特定の属性の比較 (<, =, >)", desc:"3 = 風", f:(i,a,v)=> 3 == v, diff:4 },
  { name:"3と特定の属性の比較 (<, =, >)", desc:"3 < 風", f:(i,a,v)=> 3 < v, diff:4 },

  // 4と特定の属性の比較
  { name:"4と特定の属性の比較 (<, =, >)", desc:"4 > 炎", f:(i,a,v)=> 4 > i, diff:4 },
  { name:"4と特定の属性の比較 (<, =, >)", desc:"4 = 炎", f:(i,a,v)=> 4 == i, diff:4 },
  { name:"4と特定の属性の比較 (<, =, >)", desc:"4 < 炎", f:(i,a,v)=> 4 < i, diff:4 },
  { name:"4と特定の属性の比較 (<, =, >)", desc:"4 > 水", f:(i,a,v)=> 4 > a, diff:4 },
  { name:"4と特定の属性の比較 (<, =, >)", desc:"4 = 水", f:(i,a,v)=> 4 == a, diff:4 },
  { name:"4と特定の属性の比較 (<, =, >)", desc:"4 < 水", f:(i,a,v)=> 4 < a, diff:4 },
  { name:"4と特定の属性の比較 (<, =, >)", desc:"4 > 風", f:(i,a,v)=> 4 > v, diff:4 },
  { name:"4と特定の属性の比較 (<, =, >)", desc:"4 = 風", f:(i,a,v)=> 4 == v, diff:4 },
  { name:"4と特定の属性の比較 (<, =, >)", desc:"4 < 風", f:(i,a,v)=> 4 < v, diff:4 },

//特定同士の比較
  // 炎 vs 水
  { name:"特定の属性同士の比較 (<, =, >)", desc:"炎 > 水", f:(i,a,v)=> i > a, diff:4 },
  { name:"特定の属性同士の比較 (<, =, >)", desc:"炎 = 水", f:(i,a,v)=> i == a, diff:4 },
  { name:"特定の属性同士の比較 (<, =, >)", desc:"炎 < 水", f:(i,a,v)=> i < a, diff:4 },
  // 炎 vs 風
  { name:"特定の属性同士の比較 (<, =, >)", desc:"炎 > 風", f:(i,a,v)=> i > v, diff:4 },
  { name:"特定の属性同士の比較 (<, =, >)", desc:"炎 = 風", f:(i,a,v)=> i == v, diff:4 },
  { name:"特定の属性同士の比較 (<, =, >)", desc:"炎 < 風", f:(i,a,v)=> i < v, diff:4 },
  // 水 vs 炎
  { name:"特定の属性同士の比較 (<, =, >)", desc:"水 > 炎", f:(i,a,v)=> a > i, diff:4 },
  { name:"特定の属性同士の比較 (<, =, >)", desc:"水 = 炎", f:(i,a,v)=> a == i, diff:4 },
  { name:"特定の属性同士の比較 (<, =, >)", desc:"水 < 炎", f:(i,a,v)=> a < i, diff:4 },
  // 水 vs 風
  { name:"特定の属性同士の比較 (<, =, >)", desc:"水 > 風", f:(i,a,v)=> a > v, diff:4 },
  { name:"特定の属性同士の比較 (<, =, >)", desc:"水 = 風", f:(i,a,v)=> a == v, diff:4 },
  { name:"特定の属性同士の比較 (<, =, >)", desc:"水 < 風", f:(i,a,v)=> a < v, diff:4 },
  // 風 vs 炎
  { name:"特定の属性同士の比較 (<, =, >)", desc:"風 > 炎", f:(i,a,v)=> v > i, diff:4 },
  { name:"特定の属性同士の比較 (<, =, >)", desc:"風 = 炎", f:(i,a,v)=> v == i, diff:4 },
  { name:"特定の属性同士の比較 (<, =, >)", desc:"風 < 炎", f:(i,a,v)=> v < i, diff:4 },
  // 風 vs 水
  { name:"特定の属性同士の比較 (<, =, >)", desc:"風 > 水", f:(i,a,v)=> v > a, diff:4 },
  { name:"特定の属性同士の比較 (<, =, >)", desc:"風 = 水", f:(i,a,v)=> v == a, diff:4 },
  { name:"特定の属性同士の比較 (<, =, >)", desc:"風 < 水", f:(i,a,v)=> v < a, diff:4 },

];
