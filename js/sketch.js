/* p5.js instance-mode sketch: responsive drawing plus ordinary HTML controls. */
'use strict';
(() => {
 const host=document.querySelector('#cluster-canvas');
 if(!host)return;
 if(typeof p5==='undefined'||typeof ClusterLab==='undefined'){
   document.querySelector('#lab-status').textContent='The local visualisation library could not load. Check that the vendor folder was extracted.';
   document.querySelectorAll('.lab-controls button,.lab-controls input').forEach(control=>control.disabled=true);
   return;
 }
 const model=new ClusterLab.KMeans(3);
 const run=document.querySelector('#lab-run');
 const slider=document.querySelector('#cluster-k');
 const palette=['#067764','#4461a9','#ad5d21','#8e4b88','#3e7585'];
 let timer=null, canvas;
 function stop(){clearInterval(timer);timer=null;run.innerHTML='Run clustering <span aria-hidden="true">▷</span>';run.setAttribute('aria-pressed','false');}
 function update(){
   document.querySelector('#lab-iteration').textContent=String(model.iteration);
   document.querySelector('#lab-error').textContent=model.error===null?'—':model.error.toFixed(1);
   document.querySelector('#lab-status').textContent=model.converged?`Converged after ${model.iteration} iterations. Assignments have stabilised. Reset or change the number of clusters to explore again.`:model.iteration?`Iteration ${model.iteration}: points assigned and centroids updated. Run another step to see whether the groups change.`:'Ready. Run one step to assign points to their nearest centroid.';
   const tbody=document.querySelector('#cluster-table');tbody.replaceChildren();
   model.summary().forEach(group=>{const row=document.createElement('tr');[group.label,group.count,group.x.toFixed(1),group.y.toFixed(1)].forEach(value=>{const cell=document.createElement('td');cell.textContent=String(value);row.append(cell);});tbody.append(row);});
   const points=document.querySelector('#point-table');points.replaceChildren();
   model.points.forEach((point,index)=>{const row=document.createElement('tr');[index+1,point.x.toFixed(1),point.y.toFixed(1),point.cluster<0?'Unassigned':String.fromCharCode(65+point.cluster)].forEach(value=>{const cell=document.createElement('td');cell.textContent=String(value);row.append(cell);});points.append(row);});
   document.querySelector('.chart-legend').replaceChildren();
   const legend=document.querySelector('.chart-legend');
   palette.slice(0,model.k).forEach((color,index)=>{const item=document.createElement('span'),dot=document.createElement('i');dot.style.setProperty('--legend',color);item.append(dot,document.createTextNode(`Cluster ${String.fromCharCode(65+index)}`));legend.append(item);});
   const centroidLegend=document.createElement('span');centroidLegend.textContent='◇ = centroid';legend.append(centroidLegend);
   canvas?.redraw();
 }
 function step(){model.step();update();if(model.converged)stop();}
 run.setAttribute('aria-pressed','false');
 run.addEventListener('click',()=>{
   if(timer){stop();return;}
   if(model.converged){DepartmentUI.notify('The model has converged. Reset the experiment to run again.');return;}
   step();
   if(!model.converged){run.textContent='Pause clustering Ⅱ';run.setAttribute('aria-pressed','true');timer=setInterval(step,900);}
 });
 document.querySelector('#lab-step').addEventListener('click',()=>{stop();step();});
 const reset=()=>{stop();model.reset(Number(slider.value));document.querySelector('#k-value').value=slider.value;update();};
 slider.addEventListener('input',reset);
 document.querySelector('#lab-reset').addEventListener('click',reset);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
 canvas=new p5(p=>{
   let chartWidth,chartHeight;
   const dimensions=()=>{chartWidth=Math.max(220,Math.floor(host.getBoundingClientRect().width));chartHeight=Math.round(Math.min(420,Math.max(270,chartWidth*.62)));};
   p.setup=()=>{dimensions();const c=p.createCanvas(chartWidth,chartHeight);c.parent(host);c.elt.setAttribute('role','img');c.elt.setAttribute('aria-label','Sample data clustering plot. The equivalent cluster summary and point coordinates are available in the table below.');p.pixelDensity(1);p.noLoop();document.querySelector('#canvas-fallback').hidden=true;update();};
   p.draw=()=>{
     p.background('#f8faf8');
     const left=40,right=p.width-22,top=25,bottom=p.height-38;
     const x=value=>p.map(value,0,100,left,right),y=value=>p.map(value,0,100,bottom,top);
     p.textFont('Arial');p.textSize(11);p.strokeWeight(1);
     for(let t=0;t<=100;t+=25){p.stroke('#dde6e2');p.line(x(t),top,x(t),bottom);p.line(left,y(t),right,y(t));p.noStroke();p.fill('#60716e');p.textAlign(p.CENTER);p.text(t,x(t),bottom+18);p.textAlign(p.RIGHT);p.text(t,left-9,y(t)+4);}
     p.fill('#526762');p.textAlign(p.CENTER);p.text('Feature X',p.width/2,p.height-5);
     p.push();p.translate(12,p.height/2);p.rotate(-Math.PI/2);p.text('Feature Y',0,0);p.pop();
     model.points.forEach(point=>{
       const col=point.cluster<0?'#879b93':palette[point.cluster];p.fill(col);p.noStroke();
       const xx=x(point.x),yy=y(point.y),s=8;
       switch(point.cluster){case 1:p.rect(xx-s/2,yy-s/2,s,s,1);break;case 2:p.triangle(xx,yy-5,xx-5,yy+4,xx+5,yy+4);break;case 3:p.push();p.translate(xx,yy);p.rotate(Math.PI/4);p.rect(-3.8,-3.8,7.6,7.6);p.pop();break;case 4:p.stroke(col);p.strokeWeight(2);p.line(xx-4,yy-4,xx+4,yy+4);p.line(xx+4,yy-4,xx-4,yy+4);p.strokeWeight(1);break;default:p.circle(xx,yy,s);}
     });
     model.centres.forEach((centre,index)=>{const xx=x(centre.x),yy=y(centre.y);p.fill('#ffffff');p.stroke(palette[index]);p.strokeWeight(3);p.quad(xx,yy-10,xx+10,yy,xx,yy+10,xx-10,yy);p.noStroke();p.fill('#203a33');p.textAlign(p.CENTER);p.textStyle(p.BOLD);p.text(String.fromCharCode(65+index),xx,yy-15);p.textStyle(p.NORMAL);});
   };
   p.windowResized=()=>{dimensions();p.resizeCanvas(chartWidth,chartHeight);p.redraw();};
 });
 update();
})();
