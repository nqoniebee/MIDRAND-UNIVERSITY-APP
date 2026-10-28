/* Pure k-means logic, separated from drawing so its mathematics can be tested. */
(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.ClusterLab=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const squaredDistance=(a,b)=>(a.x-b.x)**2+(a.y-b.y)**2;
 function makePoints(seed=236){
   let state=seed>>>0;
   const random=()=>{state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;};
   const anchors=[{x:24,y:30},{x:69,y:32},{x:50,y:75}];
   return Array.from({length:60},(_,i)=>{
     const centre=anchors[i%3],angle=random()*Math.PI*2,radius=Math.sqrt(random())*18;
     return {x:centre.x+Math.cos(angle)*radius,y:centre.y+Math.sin(angle)*radius,cluster:-1};
   });
 }
 class KMeans {
   constructor(k=3){this.reset(k);}
   reset(k=3){
     if(!Number.isInteger(k)||k<2||k>5)throw new RangeError('k must be an integer from 2 to 5');
     this.k=k;this.points=makePoints();this.iteration=0;this.converged=false;this.error=null;
     // Deliberately different initial centres show the assignment/update process.
     const initial=[{x:18,y:18},{x:82,y:80},{x:22,y:82},{x:82,y:18},{x:50,y:48}];
     this.centres=initial.slice(0,k).map(p=>({...p}));
   }
   step(){
     if(this.converged)return this.summary();
     let changed=false;
     this.points.forEach(point=>{
       let best=0;
       this.centres.forEach((centre,index)=>{if(squaredDistance(point,centre)<squaredDistance(point,this.centres[best]))best=index;});
       if(point.cluster!==best)changed=true;
       point.cluster=best;
     });
     this.centres=this.centres.map((old,index)=>{
       const members=this.points.filter(point=>point.cluster===index);
       // Keep an empty group's centre rather than dividing by zero.
       return members.length?{x:members.reduce((s,p)=>s+p.x,0)/members.length,y:members.reduce((s,p)=>s+p.y,0)/members.length}:{...old};
     });
     this.iteration+=1;
     this.error=this.points.reduce((sum,p)=>sum+squaredDistance(p,this.centres[p.cluster]),0);
     this.converged=!changed||this.iteration>=40;
     return this.summary();
   }
   summary(){return this.centres.map((centre,index)=>({label:String.fromCharCode(65+index),count:this.points.filter(point=>point.cluster===index).length,...centre}));}
 }
 return {KMeans,makePoints,squaredDistance};
});
