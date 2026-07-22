/* Tiny SVG chart helpers — no external deps */
const Charts = {
  spark(data, w=84, h=30, color='#2E6BE6'){
    const max=Math.max(...data), min=Math.min(...data);
    const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-4-((v-min)/(max-min||1))*(h-8)}`).join(' ');
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity=".9"
        stroke-dasharray="220" stroke-dashoffset="220" style="animation:dash 1.2s .3s cubic-bezier(.22,.72,.28,1) forwards"/>
      <style>@keyframes dash{to{stroke-dashoffset:0}}</style></svg>`;
  },

  bars(labels, values, {h=150, color='#2E6BE6', unit='', color2=null, values2=null}={}){
    const w=100/labels.length, max=Math.max(...values, ...(values2||[0]));
    let bars='', bars2='', labs='';
    values.forEach((v,i)=>{
      const bh=(v/max)*(h-38), x=i*w+(values2? w*0.16 : w*0.24);
      const bw=values2? w*0.3 : w*0.52;
      bars+=`<rect x="${x}%" y="${h-24-bh}" width="${bw}%" height="${bh}" rx="3" fill="${color}" opacity="0" style="animation:barIn .6s ${i*0.06}s cubic-bezier(.22,.72,.28,1) forwards"/>`;
      if(values2){ const b2=(values2[i]/max)*(h-38);
        bars2+=`<rect x="${i*w+w*0.52}%" y="${h-24-b2}" width="${w*0.3}%" height="${b2}" rx="3" fill="${color2}" opacity="0" style="animation:barIn .6s ${i*0.06+.05}s cubic-bezier(.22,.72,.28,1) forwards"/>`; }
      labs+=`<text x="${i*w+w/2}%" y="${h-8}" text-anchor="middle" font-size="10" fill="#8B94A3" font-weight="600">${labels[i]}</text>`;
    });
    return `<svg width="100%" height="${h}" style="overflow:visible">
      <style>@keyframes barIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}</style>
      ${bars}${bars2}${labs}</svg>`;
  },

  line(labels, values, {h=150, color='#0E9F5A', fill=true}={}){
    const n=labels.length, max=Math.max(...values)*1.15;
    const px=i=>4+(i/(n-1))*92, py=v=>10+(1-(v/max))*(h-44);
    const pts=values.map((v,i)=>`${px(i)},${py(v)}`).join(' ');
    const area=`4,${h-30} ${pts} 96,${h-30}`;
    let labs=''; labels.forEach((l,i)=>{ labs+=`<text x="${px(i)}%" y="${h-8}" text-anchor="middle" font-size="10" fill="#8B94A3" font-weight="600">${l}</text>`; });
    let dots=''; values.forEach((v,i)=>{ dots+=`<circle cx="${px(i)}%" cy="${py(v)}" r="3.2" fill="#fff" stroke="${color}" stroke-width="2" opacity="0" style="animation:fadeI .3s ${.5+i*.07}s forwards"/>`; });
    return `<svg width="100%" height="${h}" style="overflow:visible" preserveAspectRatio="none">
      <style>@keyframes fadeI{to{opacity:1}}@keyframes dash2{to{stroke-dashoffset:0}}</style>
      ${fill?`<polygon points="${area.replace(/([\d.]+),/g,(m,p)=>p+'%,')}" fill="${color}" opacity=".08"/>`:''}
      <polyline points="${pts.replace(/([\d.]+),/g,(m,p)=>p+'%,')}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round"
        stroke-dasharray="600" stroke-dashoffset="600" style="animation:dash2 1.4s .2s cubic-bezier(.22,.72,.28,1) forwards"/>
      ${dots}${labs}</svg>`;
  },

  donut(pct, {size=92, color='#0E9F5A', track='#EEF0F2', label=''}={}){
    const r=(size-12)/2, c=2*Math.PI*r, off=c*(1-pct/100);
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${track}" stroke-width="9"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${c}" transform="rotate(-90 ${size/2} ${size/2})"
        style="transition:stroke-dashoffset 1.2s cubic-bezier(.22,.72,.28,1)" data-target="${off}"/>
      <text x="50%" y="47%" text-anchor="middle" font-size="${size*0.2}" font-weight="800" fill="#181C22" dominant-baseline="middle">${pct}%</text>
      ${label?`<text x="50%" y="66%" text-anchor="middle" font-size="9.5" font-weight="600" fill="#8B94A3">${label}</text>`:''}
    </svg>`;
  },

  /* call after insert to trigger donut animation */
  arm(root){
    requestAnimationFrame(()=>{ root.querySelectorAll('circle[data-target]').forEach(c=>{ c.style.strokeDashoffset=c.dataset.target; }); });
  },
};
