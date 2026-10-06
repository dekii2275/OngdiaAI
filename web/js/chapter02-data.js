/* Stable IDs are shared by the world, journal, navigation graph and save file. */
(function(root){
  const clue=(id,label,x,y,speaker,text)=>({id,label,x,y,speaker,text,type:'clue'});
  const exit=(id,label,to,x,y,sub='')=>({id,label,to,x,y,sub,type:'exit'});
  const scenes={
    gate:{name:'Cổng trường phía sau',art:'gate',position:'left center',links:['junction'],spots:[{id:'puzzle-gate',label:'Bộ đàm của cô Thảo',x:24,y:55,type:'puzzle',puzzle:'gate'},exit('to-junction','Đi tới ngã ba','junction',76,70,'Đi cùng cô Thảo')]},
    junction:{name:'Ngã ba trong mưa',art:'junction',links:['gate','hill','suspension','north'],spots:[{id:'puzzle-junction',label:'Bảng tuyến sơ tán',x:40,y:56,type:'puzzle',puzzle:'junction'},exit('to-hill','Đường chân đồi','hill',23,48,'450 m · Tuyến A'),exit('to-suspension','Cầu treo','suspension',51,43,'200 m · Tuyến B'),exit('to-north','Đường phía Bắc','north',79,52,'650 m · Tuyến C'),exit('to-gate','Cổng trường','gate',14,83,'Quay về khu quan sát')]},
    hill:{name:'A · Đường men sườn đồi',art:'hill',links:['junction'],spots:[
      clue('rock','Đá nhỏ lăn xuống',22,62,'Bạn','Một viên đá vừa lăn từ sườn dốc. Một dấu hiệu riêng lẻ chưa đủ để kết luận. Mình cần nhìn cả khu vực.'),
      clue('tree','Cây nghiêng, rễ lộ',53,41,'Duyên','Cây nghiêng về phía đường. Rễ lộ ra và phần đất dưới gốc đã bị trôi mất.'),
      clue('seep','Nước đục rỉ từ đất',73,55,'Thảo','Nước đục rỉ ra từ bên trong sườn đất. Đứng ở đây quan sát thôi, đừng tới sát chân dốc.'),
      clue('crack','Vết nứt mới',65,72,'Bạn','Vết nứt còn mới. Khi ghép với cây nghiêng, nước rỉ và đá rơi, sườn dốc này đang có nhiều dấu hiệu mất ổn định.'),
      {id:'judge-hill',label:'Đánh giá tuyến A',x:83,y:73,type:'decision',route:'hill'},exit('back-hill','Quay lại ngã ba','junction',13,85)]},
    suspension:{name:'B · Bờ cầu treo',art:'suspension',links:['junction'],spots:[
      clue('current','Dòng nước chảy xiết',35,65,'Duyên','Bình thường con suối nhỏ lắm. Giờ nước nâu đục chảy rất nhanh, dù mặt cầu vẫn chưa ngập.'),
      clue('debris','Cây trôi dưới cầu',65,65,'Bạn','Một thân cây bị cuốn vào kết cấu bên dưới. Cầu vừa rung. Dòng nước đang mang theo cả vật nặng.'),
      clue('waterline','Vạch mực nước cũ',51,48,'Bạn','Nước cao hơn vạch cũ rất nhiều và gần tới phần dưới cầu. Mặt cầu khô không cho biết kết cấu bên dưới còn ổn định hay không.'),
      {id:'judge-bridge',label:'Đánh giá tuyến B',x:82,y:76,type:'decision',route:'suspension'},exit('back-bridge','Quay lại ngã ba','junction',13,85)]},
    north:{name:'C · Đường phía Bắc',art:'road',position:'left center',links:['junction','concrete'],spots:[
      clue('road','Mặt đường ướt',27,72,'Bạn','Có vũng nước mưa, nhưng không có dòng nước chảy cắt ngang đường.'),
      clue('clearance','Khoảng cách với đồi',54,45,'Duyên','Sườn đồi ở xa. Đường đi qua cánh đồng cao, không sát bờ đất như tuyến A.'),
      clue('sign','Cọc tuyến sơ tán',75,59,'Thảo','Đây là tuyến sơ tán dự phòng đã có từ trước. Biển chỉ đường giúp định hướng; mình vẫn phải kiểm tra tình trạng hôm nay.'),
      {id:'puzzle-north',label:'Đối chiếu tuyến dự phòng',x:82,y:69,type:'puzzle',puzzle:'north'},{id:'manh',label:'Bác Mạnh',x:62,y:76,type:'npc'},exit('to-concrete','Tới cầu phía Bắc','concrete',86,43,'Kiểm tra trước khi qua'),exit('back-north','Quay lại ngã ba','junction',12,85)]},
    concrete:{name:'Cầu phía Bắc · Bờ gần',art:'north',position:'right center',links:['north','highroad'],spots:[
      clue('deck','Kiểm tra mặt cầu',39,51,'Bạn','Không có nước tràn qua mặt cầu, không thấy vết nứt rõ. Mình đang quan sát từ đầu cầu.'),
      clue('level','Kiểm tra mực nước',61,64,'Mạnh','Nước vẫn chảy mạnh nhưng còn cách mặt cầu. Đây là đánh giá ở thời điểm hiện tại, không phải bảo đảm cho mọi lúc.'),
      clue('piers','Dòng chảy quanh trụ',78,51,'Mạnh','Tôi vừa kiểm tra hai đầu cầu. Hiện chưa thấy vật lớn kẹt, trụ nghiêng hay vật trôi va liên tục. Qua cầu đi đều, theo nhóm.'),
      {id:'puzzle-concrete',label:'Sắp đội hình qua cầu',x:64,y:71,type:'puzzle',puzzle:'concrete'},{id:'cross',to:'highroad',label:'Đi cùng nhóm qua cầu',x:84,y:77,type:'cross',sub:'Mạnh dẫn đường'},exit('back-concrete','Trở lại đường Bắc','north',13,85)]},
    highroad:{spawn:{x:75,y:88},walk:{min:64,max:86},name:'Đường cao · Bờ xa',art:'highroad',position:'right top',links:['concrete','refuge'],spots:[clue('highroad-marker','Mốc chỉ dẫn đường cao',70,60,'Minh Anh','[Bộ đàm] Đi theo cọc tuyến sơ tán, giữ đường cao rồi hướng tới mái nhà có đèn vàng. Không rẽ xuống làng.'),{id:'puzzle-highroad',label:'Nối các mốc đường đi',x:82,y:71,type:'puzzle',puzzle:'highroad'},exit('to-refuge','Lên điểm tập kết','refuge',81,42,'Còn khoảng 300 m'),exit('back-highroad','Trở lại đầu cầu','concrete',64,84,'Qua cùng nhóm')]},
    refuge:{spawn:{x:72,y:88},walk:{min:56,max:88},name:'Sườn đồi điểm tập kết',art:'refuge',position:'center top',links:['highroad'],spots:[{id:'finale',label:'Liên lạc Minh Anh',x:82,y:55,type:'finale',sub:'Kết thúc chương'},exit('back-refuge','Trở lại đường cao','highroad',55,83)]}
  };
  const required={hill:['rock','tree','seep','crack'],suspension:['current','debris','waterline'],north:['road','clearance','sign'],concrete:['deck','level','piers']};
  const initial=()=>({version:2,solved:[],scene:'gate',clues:[],visited:[],judged:[],manh:false,crossed:false,complete:false,started:false,settings:{sound:false,reduced:false},position:{x:48,y:88}});
  function canCross(s){return s.solved.includes('concrete')&&s.manh&&['hill','suspension'].every(r=>s.judged.includes(r))&&['hill','suspension','north','concrete'].every(r=>required[r].every(c=>s.clues.includes(c)));}
  function canTravel(s,to){if(!scenes[s.scene]?.links.includes(to))return false;const gate=travelPuzzle(s.scene,to);if(gate&&!s.solved.includes(gate))return false;if((s.scene==='concrete'&&to==='highroad')||(s.scene==='highroad'&&to==='concrete'))return canCross(s);return true;}
  function travelPuzzle(from,to){if(from==='gate'&&to==='junction')return 'gate';if(from==='junction'&&['hill','suspension','north'].includes(to))return 'junction';if(from==='north'&&to==='concrete')return 'north';if(from==='highroad'&&to==='refuge')return 'highroad';return null;}
  function restore(raw){if(!raw||raw.version!==2||!scenes[raw.scene])return null;const s=initial(),valid=new Set(Object.values(scenes).flatMap(v=>v.spots.filter(p=>p.type==='clue').map(p=>p.id)));s.clues=Array.isArray(raw.clues)?[...new Set(raw.clues.filter(c=>valid.has(c)))]:[];s.visited=Array.isArray(raw.visited)?raw.visited.filter(v=>scenes[v]):[];s.judged=Array.isArray(raw.judged)?raw.judged.filter(v=>['hill','suspension'].includes(v)):[];for(const k of ['manh','crossed','complete','started'])s[k]=raw[k]===true;s.settings={sound:raw.settings?.sound===true,reduced:raw.settings?.reduced===true};s.scene=raw.scene;s.solved=Array.isArray(raw.solved)?[...new Set(raw.solved.filter(id=>scenes[id]))]:[...(s.visited.includes('junction')?['gate']:[]),...(s.visited.some(id=>['hill','suspension','north'].includes(id))?['junction']:[]),...s.judged,...(s.visited.includes('concrete')?['north']:[]),...(s.crossed?['concrete']:[]),...(s.visited.includes('refuge')?['highroad']:[]),...(s.complete?['refuge']:[])];if(['highroad','refuge'].includes(s.scene)&&!canCross(s))s.scene='concrete';if(Number.isFinite(raw.position?.x)&&Number.isFinite(raw.position?.y))s.position={x:Math.max(12,Math.min(88,raw.position.x)),y:Math.max(76,Math.min(91,raw.position.y))};return s;}
  const data={scenes,required,initial,canCross,canTravel,travelPuzzle,restore};if(typeof module==='object'&&module.exports)module.exports=data;else root.Chapter02=data;
})(typeof window==='object'?window:globalThis);
