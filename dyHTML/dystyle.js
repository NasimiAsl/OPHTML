
export function dyStyle() { };

dyStyle._prototype = {

  init: function (value) {
    var sty = document.createElement('Style');
    sty.innerHTML = value;
    document.head.appendChild(sty);
    console.log(sty);
  },

  live: function (id, value) {
    var sty = document.getElementById(id);

    if (!sty) {
      sty = document.createElement('Style');
      sty.id = id;
      sty.innerHTML = value;
      document.head.appendChild(sty);
    }
    else sty.innerHTML = value;
  },

  default_template: function () {

  },
  shadow: function (name, op) {
    var s = `
    
   `;

    for (var shadow in op.shadows) {

      s += ((`
      .shadow-`+ name + `-value-opacity {  
        -webkit-box-shadow: 1px 1px valuepx 0px rgba(`+ def(op.rgb, '0,0,0') + `,.opacity);
        -moz-box-shadow: 1px 1px valuepx 0px rgba(`+ def(op.rgb, '0,0,0') + `,.opacity);
        box-shadow: 1px 1px valuepx 0px rgba(`+ def(op.rgb, '0,0,0') + `,.opacity);
      }
      .shadow-h`+ name + `-value-opacity:hover {  
        -webkit-box-shadow: 1px 1px valuepx 0px rgba(`+ def(op.rgb, '0,0,0') + `,.opacity);
        -moz-box-shadow: 1px 1px valuepx 0px rgba(`+ def(op.rgb, '0,0,0') + `,.opacity);
        box-shadow: 1px 1px valuepx 0px rgba(`+ def(op.rgb, '0,0,0') + `,.opacity);
      }
    `).replaceAll('-value', '-' + op.shadows[shadow].split('.')[0])
        .replaceAll('value', op.shadows[shadow].split('.')[0])
        .replaceAll('opacity', op.shadows[shadow].split('.')[1]));
    }

    return s;

  },
  border: function (op) {
    var s = `

    .b-none { border: none !important; }
     .b-solid { border-style: solid !important; }
    .b-dash { border-style: dashed !important; }
    .b-dot { border-style: dotted !important; }
    
   `;

    for (var brd in op.borders) {

      s += `

       .ba-00 {
        border : none !important;
           border-style: solid;
      }
      .ba-size {
        border-width: value !important;
        border-style: solid;
      }
      .bt-size {
        border-top-width: value !important;
           border-style: solid;
      }
      .bb-size {
        border-bottom-width: value !important;
           border-style: solid;
      } 
      .bl-size {
        border-left-width: value !important;
           border-style: solid;
      }
      .br-size {
        border-right-width: value !important;
           border-style: solid;
      }      
    `.replaceAll('-size', '-' + brd)
        .replaceAll('value', op.borders[brd].split('.')[0]);
    }


    return s;

  },
  fontSize: function (op) {
    var s = `
    .fw-100 {  font-weight:100;}
    .fw-300 {  font-weight:300;}
    .fw-500 {  font-weight:500;}
    .fw-700 {  font-weight:700;}
    .fw-900 {  font-weight:900;}
    .ta-left {  text-align:left; }
    .ta-center {  text-align:center; }
    .ta-right {  text-align:right; }
    
    
    `;
    for (var size in op.textSizes) {
      s += `
      .fs-width { font-size: value; }
      .fs-i-width { font-size: value !important; }
    `.replaceAll('-width', '-' + size).replaceAll(' value', ' ' + op.textSizes[size] + '');
    }
    return s;
  },
  size: function (op) {
    var s = `
    .asp-1x1,.asp-2x2,.asp-3x3,.asp-4x4  { aspect-ratio:4x4 !important;}
    .asp-2x4,.asp-1x2  { aspect-ratio:2x4 !important;}
    .asp-4x2,.asp-2x1  { aspect-ratio:4x2 !important;}
    .asp-1x3  { aspect-ratio:3x9 !important;}
    .asp-3x1  { aspect-ratio:9x3 !important;}
    .asp-2x3  { aspect-ratio:2x3 !important;}
    .asp-3x2  { aspect-ratio:3x2 !important;}
    .asp-1x4  { aspect-ratio:1x4 !important;}
    .asp-3x4  { aspect-ratio:3x4 !important;}
    .asp-4x1  { aspect-ratio:4x1 !important;}
    .asp-4x3  { aspect-ratio:4x3 !important;}
     
    
    `;
    for (var size in op.sizes) {
      s += `

      
  ._w-mx-key {
   max-width: value;
 }

  ._w-ex-key {
   max-width: value;
   min-width: value;
   width: value;
 }

  ._h-ex-key {
   max-height: value;
   min-height: value;
  height: value;
 }

 ._h-mx-key {
   max-height: value;
 }

 ._w-mn-key {
   min-width: value;
 }

 ._h-mn-key {
   min-height: value;
 }

 ._w-mx-i-key {
   max-width: value !important;
 }

 ._h-mx-i-key {
   max-height: value !important;
 }

 ._w-mn-i-key {
   min-width: value !important;
 }

 ._h-mn-i-key {
   min-height: value !important;
 }

 ._w-key {
   width: value;
 }

 ._h-key {
   height: value;
 }

 .l-key {
   left: value;
 }

 .r-key {
   right: value;
 }

 .t-key {
   top: value;
 }

 .b-key {
   bottom: value;
 }

 ._pl-key {
   padding-left: value;
 }

 ._pr-key {
   padding-right: value;
 }

 ._pt-key {
   padding-top: value;
 }

 ._pb-key {
   padding-bottom: value;
 }

 ._ptb-key {
   padding-bottom: value;
   padding-top: value;
 }

 ._plr-key {
   padding-left: value;
   padding-right: value;
 }

 ._p-key {
   padding: value;
 }

 ._ptb-i-key {
   padding-bottom: 0px !important;
   padding-top: 0px !important;
 }

 ._plr-i-key {
   padding-left: 0px !important;
   padding-right: 0px !important;
 }

 ._p-i-key {
   padding: value;
 }

 .ml-key {
   margin-left: value;
 }

 .mr-key {
   margin-right: value;
 }

 .mt-key {
   margin-top: value;
 }

 .mb-key {
   margin-bottom: value;
 }

 .mtb-key {
   margin-bottom: value;
   margin-top: value;
 }

 .mlr-key {
   margin-left: value;
   margin-right: value;
 }

 .m-key {
   margin: value;
 }

 .mtb-i-key {
   margin-bottom: 0px !important;
   margin-top: 0px !important;
 }

 .mlr-i-key {
   margin-left: 0px !important;
   margin-right: 0px !important;
 }

 .m-i-key {
   margin: 0px !important;
 }

 

 ._w-i-key {
   width: 0px !important;
 }

 ._h-i-key {
   height: 0px !important;
 }

 .l-i-key {
   left: 0px !important;
 }

 .r-i-key {
   right: 0px !important;
 }

 .t-i-key {
   top: 0px !important;
 }

 .b-i-key {
   bottom: 0px !important;
 }

 ._pl-i-key {
   padding-left: 0px !important;
 }

 ._pr-i-key {
   padding-right: 0px !important;
 }

 ._pt-i-key {
   padding-top: 0px !important;
 }

 ._pb-i-key {
   padding-bottom: 0px !important;
 }

 .ml-i-key {
   margin-left: 0px !important;
 }

 .mr-i-key {
   margin-right: 0px !important;
 }

 .mt-i-key {
   margin-top: 0px !important;
 }

 .mb-i-key {
   margin-bottom: 0px !important;
 }

 .l-nkey {
   left: -1.0*value;
 }

 .r-nkey {
   right: -1.0*value;
 }

 .t-nkey {
   top: -1.0*value;
 }

 .b-nkey {
   bottom: -1.0*value;
 }  
   `.replaceAll('-key', '-' + size).replaceAll(' value;', ' ' + op.sizes[size] + ';');
    }
    return s;
  },
  flex: function () {
    return `  /*

    f   :   flex
    fl  :   flex-inline
    f-c :   column
    f-r :   row
    f-rr:   row - reverse
    f-c :   column
    f-cr:   column - reverse
    f-w:    wrap
    f-wr:   wrap - reverse
    f-nw:   no-wrap
    f-a?: align-items s:start c:center e:end t:stretch l:baseline
    f-c?: align-content s:start c:center e:end a:space-around b:space-between t:stretch
    f-j?: justify-content s:start c:center e:end a:space-around b:space-between 
    f-s?: align-self s:start c:center e:end t:stretch l:baseline
    f-i01: flex: 0 1 auto;
    f-i00: flex: 0 0 auto;
    f-i11: flex: 1 1 auto;
    f-i10: flex: 1 0 auto; 

*/
 .f {
   display: -webkit-box;
   display: -moz-box;
   display: -ms-flexbox;
   display: -webkit-flex;
   display: flex;
       unicode-bidi: normal;
 }

 .fl {
   display: -webkit-box;
   display: -moz-box;
   display: -ms-inline-flexbox;
   display: -webkit-inline-flex;
   display: inline-flex;
 }

 .f-r {
   -webkit-box-direction: normal;
   -moz-box-direction: normal;
   -webkit-box-orient: horizontal;
   -moz-box-orient: horizontal;
   -webkit-flex-direction: row;
   -ms-flex-direction: row;
   flex-direction: row;
 }

 .f-rr {
   -webkit-box-direction: reverse;
   -moz-box-direction: reverse;
   -webkit-box-orient: horizontal;
   -moz-box-orient: horizontal;
   -webkit-flex-direction: row-reverse;
   -ms-flex-direction: row-reverse;
   flex-direction: row-reverse;
 }

 .f-c {
   -webkit-box-direction: normal;
   -moz-box-direction: normal;
   -webkit-box-orient: vertical;
   -moz-box-orient: vertical;
   -webkit-flex-direction: column;
   -ms-flex-direction: column;
   flex-direction: column;
 }

 .f-cr {
   -webkit-box-direction: reverse;
   -moz-box-direction: reverse;
   -webkit-box-orient: vertical;
   -moz-box-orient: vertical;
   -webkit-flex-direction: column-reverse;
   -ms-flex-direction: column-reverse;
   flex-direction: column-reverse;
 }

 .f-w {
   -webkit-flex-wrap: wrap;
   -ms-flex-wrap: wrap;
   flex-wrap: wrap;
 }

 .f-nw {
   -webkit-flex-wrap: nowrap;
   -ms-flex-wrap: nowrap;
   flex-wrap: nowrap;
    white-space: nowrap;
 }

 .f-wr {
   -webkit-flex-wrap: wrap-reverse;
   -ms-flex-wrap: wrap-reverse;
   flex-wrap: wrap-reverse;
 }

 .f-js {
   -webkit-box-pack: start;
   -moz-box-pack: start;
   -webkit-justify-content: flex-start;
   -ms-flex-pack: start;
   justify-content: flex-start;
 }

 .f-je {
   -webkit-box-pack: end;
   -moz-box-pack: end;
   -webkit-justify-content: flex-end;
   -ms-flex-pack: end;
   justify-content: flex-end;
 }

 .f-jc {
   -webkit-box-pack: center;
   -moz-box-pack: center;
   -webkit-justify-content: center;
   -ms-flex-pack: center;
   justify-content: center;
 }

 .f-jb {
   -webkit-box-pack: justify;
   -moz-box-pack: justify;
   -webkit-justify-content: space-between;
   -ms-flex-pack: justify;
   justify-content: space-between;
 }

 .f-ja {
   -webkit-box-pack: justify;
   -moz-box-pack: justify;
   -webkit-justify-content: space-around;
   -ms-flex-pack: distribute;
   justify-content: space-around;
 }

 .f-as {
   -webkit-box-align: start;
   -moz-box-align: start;
   -webkit-align-items: flex-start;
   -ms-flex-align: start;
   align-items: flex-start;
 }

 .f-ae {
   -webkit-box-align: end;
   -moz-box-align: end;
   -webkit-align-items: flex-end;
   -ms-flex-align: end;
   align-items: flex-end;
 }

 .f-ac {
   -webkit-box-align: center;
   -moz-box-align: center;
   -webkit-align-items: center;
   -ms-flex-align: center;
   align-items: center;
 }

 .f-al {
   -webkit-box-align: baseline;
   -moz-box-align: baseline;
   -webkit-align-items: baseline;
   -ms-flex-align: baseline;
   align-items: baseline;
 }

 .f-at {
   -webkit-box-align: stretch;
   -moz-box-align: stretch;
   -webkit-align-items: stretch;
   -ms-flex-align: stretch;
   align-items: stretch;
 }

 .f-cs {
   -webkit-align-content: flex-start;
   -ms-flex-line-pack: start;
   align-content: flex-start;
 }

 .f-ce {
   -webkit-align-content: flex-end;
   -ms-flex-line-pack: end;
   align-content: flex-end;
 }

 .f-cc {
   -webkit-align-content: center;
   -ms-flex-line-pack: center;
   align-content: center;
 }

 .f-cb {
   -webkit-align-content: space-between;
   -ms-flex-line-pack: justify;
   align-content: space-between;
 }

 .f-ca {
   -webkit-align-content: space-around;
   -ms-flex-line-pack: distribute;
   align-content: space-around;
 }

 .f-ct {
   -webkit-align-content: stretch;
   -ms-flex-line-pack: stretch;
   align-content: stretch;
 }

 .f-sa {
   -webkit-align-self: auto;
   -ms-flex-item-align: auto;
   align-self: auto;
 }


 .f-ss {
   -webkit-align-self: flex-start;
   -ms-flex-item-align: start;
   align-self: flex-start;
 }

 .f-se {
   -webkit-align-self: flex-end;
   -ms-flex-item-align: end;
   align-self: flex-end;
 }

 .f-sc {
   -webkit-align-self: center;
   -ms-flex-item-align: center;
   align-self: center;
 }

 .f-sl {
   -webkit-align-self: baseline;
   -ms-flex-item-align: baseline;
   align-self: baseline;
 }

 .f-st {
   -webkit-align-self: stretch;
   -ms-flex-item-align: stretch;
   align-self: stretch;
 }

 .flex-rc {
   display: -webkit-box;
   display: -moz-box;
   display: -ms-flexbox;
   display: -webkit-flex;
   display: flex;
   -webkit-box-direction: normal;
   -moz-box-direction: normal;
   -webkit-box-orient: horizontal;
   -moz-box-orient: horizontal;
   -webkit-flex-direction: row;
   -ms-flex-direction: row;
   flex-direction: row;
   -webkit-box-pack: center;
   -moz-box-pack: center;
   -webkit-justify-content: center;
   -ms-flex-pack: center;
   justify-content: center;
   -webkit-box-align: center;
   -moz-box-align: center;
   -webkit-align-items: center;
   -ms-flex-align: center;
   align-items: center;
   -webkit-flex-wrap: wrap;
   -ms-flex-wrap: wrap;
   flex-wrap: wrap;
 }

 .flex-rc>div {
   -webkit-align-self: center;
   -ms-flex-item-align: center;
   align-self: center;
   -webkit-box-flex: 0;
   -moz-box-flex: 0;
   -webkit-flex: 0 1 auto;
   -ms-flex: 0 1 auto;
   flex: 0 1 auto;
 }

 .flex-cc {
   display: -webkit-box;
   display: -moz-box;
   display: -ms-flexbox;
   display: -webkit-flex;
   display: flex;
   -webkit-box-direction: normal;
   -moz-box-direction: normal;
   -webkit-box-orient: vertical;
   -moz-box-orient: vertical;
   -webkit-flex-direction: column;
   -ms-flex-direction: column;
   flex-direction: column;
   -webkit-box-pack: center;
   -moz-box-pack: center;
   -webkit-justify-content: center;
   -ms-flex-pack: center;
   justify-content: center;
   -webkit-box-align: center;
   -moz-box-align: center;
   -webkit-align-items: center;
   -ms-flex-align: center;
   align-items: center;
   -webkit-flex-wrap: wrap;
   -ms-flex-wrap: wrap;
   flex-wrap: wrap;
 }

 .flex-cc>div {
   -webkit-align-self: center;
   -ms-flex-item-align: center;
   align-self: center;
   -webkit-box-flex: 0;
   -moz-box-flex: 0;
   -webkit-flex: 0 1 auto;
   -ms-flex: 0 1 auto;
   flex: 0 1 auto;
 }

 

 .f-center {
   display: -webkit-box;
   display: -moz-box;
   display: -ms-flexbox;
   display: -webkit-flex;
   display: flex;
   -webkit-align-content: center;
   -ms-flex-line-pack: center;
   align-content: center;
   -webkit-box-pack: center;
   -moz-box-pack: center;
   -webkit-justify-content: center;
   -ms-flex-pack: center;
   justify-content: center;
   -webkit-box-align: center;
   -moz-box-align: center;
   -webkit-align-items: center;
   -ms-flex-align: center;
   align-items: center;
 }

 .f-fit {
   display: -webkit-box;
   display: -moz-box;
   display: -ms-flexbox;
   display: -webkit-flex;
   display: flex;
   -webkit-box-direction: normal;
   -moz-box-direction: normal;
   -webkit-box-orient: vertical;
   -moz-box-orient: vertical;
   -webkit-flex-direction: column;
   -ms-flex-direction: column;
   flex-direction: column;
   -webkit-box-pack: justify;
   -moz-box-pack: justify;
   -webkit-justify-content: space-around;
   -ms-flex-pack: distribute;
   justify-content: space-around;
   -webkit-align-content: stretch;
   -ms-flex-line-pack: stretch;
   align-content: stretch;
   -webkit-box-align: stretch;
   -moz-box-align: stretch;
   -webkit-align-items: stretch;
   -ms-flex-align: stretch;
   align-items: stretch;
 }

 .f-fit>div,
 .f-fit>canvas {
   -webkit-align-self: stretch;
   -ms-flex-item-align: stretch;
   align-self: stretch;
   -webkit-box-flex: 1 ;
   -moz-box-flex: 1 ;
   -webkit-flex: 1 0 auto ;
   -ms-flex: 1 0 auto ;
   flex: 1 0 auto ;
 }

 .f-i01 {
   -webkit-box-flex: 0 ;
   -moz-box-flex: 0 ;
   -webkit-flex: 0 1 auto ;
   -ms-flex: 0 1 auto ;
   flex: 0 1 auto ;
 }

 .f-i11 {
   -webkit-box-flex: 1 ;
   -moz-box-flex: 1 ;
   -webkit-flex: 1 1 auto ;
   -ms-flex: 1 1 auto ;
   flex: 1 1 auto ;
 }

 .f-i00 {
   -webkit-box-flex: 0 ;
   -moz-box-flex: 0 ;
   -webkit-flex: 0 0 auto ;
   -ms-flex: 0 0 auto ;
   flex: 0 0 auto ;
 }

 .f-i10 {
   -webkit-box-flex: 1 ;
   -moz-box-flex: 1 ;
   -webkit-flex: 1 0 auto ;
   -ms-flex: 1 0 auto ;
   flex: 1 0 auto ;
 }

 .f-col2 {
   -webkit-column-count: 2;
   -moz-column-count: 2;
   column-count: 2;
 }

 .f-col3 {
   -webkit-column-count: 3;
   -moz-column-count: 3;
   column-count: 3;
 }

 .f-col4 {
   -webkit-column-count: 4;
   -moz-column-count: 4;
   column-count: 4;
 }
   
   `;
  },
  color: function (op) {

    var s = '';
    for (var color in op.colors) {
      if (typeof (op.colors[color]) == 'string')
        s += ` 
      
 .cmain {
   background-color: #009611;
 }

 .c-imain {
   background-color: #009611 !important;
 }

 .c-tmain {
   color: #009611;
 }

 .c-t-imain {
   color: #009611 !important;
 }

 .c-bmain {
   border-color: #009611;
 }

 .c-b-imain {
   border-color: #009611 !important;
 }

 .c-hmain:hover {
   background-color: #009611;
   cursor: pointer;
 }

 .c-i-hmain:hover {
   background-color: #009611 !important;
   cursor: pointer;
 }

 .c-t-hmain:hover {
   color: #009611;
   cursor: pointer;
 }

 .c-t-i-hmain:hover {
   color: #009611 !important;
   cursor: pointer;
 }

 .c-b-hmain:hover {
   border-color: #009611;
   cursor: pointer;
 }

 .c-b-i-hmain:hover {
   border-color: #009611 !important;
   cursor: pointer;
 }

 .c-b-i-fmain:focus {
   border-color: #009611 !important;
   cursor: pointer;
 }

 .c-fmain:focus {
   background-color: #009611;
   cursor: pointer;
 }

 .c-i-fmain:focus {
   background-color: #009611 !important;
   cursor: pointer;
 }

 .c-t-fmain:focus {
   color: #009611;
   cursor: pointer;
 }

 .c-t-i-fmain:focus {
   color: #009611 !important;
   cursor: pointer;
 }

 .c-b-fmain:focus {
   border-color: #009611;
   cursor: pointer;
 }

 .c-b-i-fmain:focus {
   border-color: #009611 !important;
   cursor: pointer;
 }
  `.replaceAll('main', color).replaceAll('#009611', op.colors[color]);
    }
    return s;

  },
  radius: function (op,key,sub) {
    

    var s = '';
    for (var rad in op.radius) {
      s +=
        `
    .irad-01 inrad {
   border-radius: 1px;
 } 

 .irad-r-01 inrad {
   border-top-right-radius: 1px;
   border-bottom-right-radius: 1px;
 }
  
 .irad-l-01 inrad {
   border-top-left-radius: 1px;
   border-bottom-left-radius: 1px;
 } 

 .irad-t-01 inrad {
   border-top-left-radius: 1px;
   border-top-right-radius: 1px;
 }
  
 .irad-b-01 inrad {
   border-bottom-left-radius: 1px;
   border-bottom-right-radius: 1px;
 } 
 
`.replaceAll('irad', def(key,'rad')) 
.replaceAll('inrad', def(sub,'')) 
.replaceAll('-01', '-' + rad).
replaceAll(' 1px;', ' ' + op.radius[rad] + ';');
    }
 
    return s;
  },
  layer: function (op) {

    var s = '';
    for (var rad in op.layers) {
      s +=
        `
      .ly-01 {
        z-index: value !important;
      }   
    `.replaceAll('-01', '-' + rad).replaceAll('value', ' ' + op.layers[rad] + '');
    }
    return s;
  },
  opacity: function (op) {

    var s = '';
    for (var opa in op.opacity) {
      s +=
        `  .op-00  {
   opacity: 0;
 }

  .op-h00:hover {
   opacity: 0;
 }

 
`.replaceAll('op-00', 'op-' + opa).replaceAll('op-h00', 'op-h' + opa).replaceAll(' 0;', ' ' + op.opacity[opa] + ';');
    }
    return s;
  },
  responsive: function (op) {
    return `
    @media (max-width: 420px) {
   .api-0000 {
     display:none !important; 
   }

   .api-0001 {
     display:none !important; 
   }

   .api-0010 {
     display:none !important; 
   }

   .api-0011 {
     display:none !important; 
   }

   .api-0100 {
     display:none !important; 
   }

   .api-0101 {
     display:none !important; 
   }

   .api-0110 {
     display:none !important; 
   }

   .api-0111 {
     display:none !important; 
   }

   .api-1000 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1001 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1010 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1011 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1100 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1101 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1110 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1111 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .wcord {
     width: 100%;
   }

   
 }

 @media (max-width: 420px) and (max-height: 420px) {
   .api-00 {
     display:none !important; 
   }

   .api-01 {
     display:none !important; 
   }

   .api-10 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-11 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .brk:after {
     content: '2';
   }
 }

 @media (max-width: 420px) and (min-height: 420px) {
   .api-00 {
     display:none !important; 
   }

   .api-01 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-10 {
     display:none !important; 
   }

   .api-11 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .brk:after {
     content: '1';
   }
 }

 @media (min-width: 420px) and (max-width: 720px) {
   .api-0000 {
     display:none !important; 
   }

   .api-0001 {
     display:none !important; 
   }

   .api-0010 {
     display:none !important; 
   }

   .api-0011 {
     display:none !important; 
   }

   .api-0100 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-0101 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-0110 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-0111 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1000 {
     display:none !important; 
   }

   .api-1001 {
     display:none !important; 
   }

   .api-1010 {
     display:none !important; 
   }

   .api-1011 {
     display:none !important; 
   }

   .api-1100 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1101 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1110 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1111 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .wcord {
     width: 100%;
   }

   .wcord div, 
   .wcord input,
   .wcord select {
     font-size: 9pt;
   }

   .brk:after {
     content: '2';
   }
 }

 @media (min-width: 720px) and (max-width: 1010px) {
   .api-0000 {
     display:none !important; 
   }

   .api-0001 {
     display:none !important; 
   }

   .api-0010 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-0011 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-0100 {
     display:none !important; 
   }

   .api-0101 {
     display:none !important; 
   }

   .api-0110 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-0111 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1000 {
     display:none !important; 
   }

   .api-1001 {
     display:none !important; 
   }

   .api-1010 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1011 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1100 {
     display:none !important; 
   }

   .api-1101 {
     display:none !important; 
   }

   .api-1110 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1111 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .wcord {
     width: 100%;
   }

   .brk:after {
     content: '3';
   }
 }

 @media (min-width: 1010px) {
   .api-0000 {
     display:none !important; 
   }

   .api-0001 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-0010 {
     display:none !important; 
   }

   .api-0011 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-0100 {
     display:none !important; 
   }

   .api-0101 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-0110 {
     display:none !important; 
   }

   .api-0111 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1000 {
     display:none !important; 
   }

   .api-1001 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1010 {
     display:none !important; 
   }

   .api-1011 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1100 {
     display:none !important; 
   }

   .api-1101 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .api-1110 {
     display:none !important; 
   }

   .api-1111 {
     display: -webkit-box;
     display: -moz-box;
     display: -ms-flexbox;
     display: -webkit-flex;
     display: flex;
   }

   .wcord {
     width: 1010px;
   }



   .brk:after {
     content: '4';
   }
 }`.replaceAll('api-', def(op.key,'resp-') )
      .replaceAll('420px', op.breakPoints[0] + 'px')
      .replaceAll('720px', op.breakPoints[1] + 'px')
      .replaceAll('1010px', op.breakPoints[2] + 'px');
  },
  animation: function () {
    return `

    .rot-45 {
    transform: rotate3d(0, 0, 1, 45deg);
    }

     .animated {
   -webkit-animation-duration: 1s;
   animation-duration: 1s;
   -webkit-animation-fill-mode: both;
   animation-fill-mode: both;
 }

 .animated.hinge {
   -webkit-animation-duration: 2s;
   animation-duration: 2s;
 }
    
 
 @-webkit-keyframes pulse {
   0% {
     -webkit-transform: scale3d(1, 1, 1);
     transform: scale3d(1, 1, 1);
   }

   50% {
     -webkit-transform: scale3d(1.05, 1.05, 1.05);
     transform: scale3d(1.05, 1.05, 1.05);
   }

   100% {
     -webkit-transform: scale3d(1, 1, 1);
     transform: scale3d(1, 1, 1);
   }
 }

 @keyframes pulse {
   0% {
     -webkit-transform: scale3d(1, 1, 1);
     transform: scale3d(1, 1, 1);
   }

   50% {
     -webkit-transform: scale3d(1.05, 1.05, 1.05);
     transform: scale3d(1.05, 1.05, 1.05);
   }

   100% {
     -webkit-transform: scale3d(1, 1, 1);
     transform: scale3d(1, 1, 1);
   }
 }

 ._pulse {
   -webkit-animation-name: pulse;
   animation-name: pulse;
 }

 @-webkit-keyframes rubberBand {
   0% {
     -webkit-transform: scale3d(1, 1, 1);
     transform: scale3d(1, 1, 1);
   }

   30% {
     -webkit-transform: scale3d(1.25, 0.75, 1);
     transform: scale3d(1.25, 0.75, 1);
   }

   40% {
     -webkit-transform: scale3d(0.75, 1.25, 1);
     transform: scale3d(0.75, 1.25, 1);
   }

   50% {
     -webkit-transform: scale3d(1.15, 0.85, 1);
     transform: scale3d(1.15, 0.85, 1);
   }

   65% {
     -webkit-transform: scale3d(.95, 1.05, 1);
     transform: scale3d(.95, 1.05, 1);
   }

   75% {
     -webkit-transform: scale3d(1.05, .95, 1);
     transform: scale3d(1.05, .95, 1);
   }

   100% {
     -webkit-transform: scale3d(1, 1, 1);
     transform: scale3d(1, 1, 1);
   }
 }

 @keyframes rubberBand {
   0% {
     -webkit-transform: scale3d(1, 1, 1);
     transform: scale3d(1, 1, 1);
   }

   30% {
     -webkit-transform: scale3d(1.25, 0.75, 1);
     transform: scale3d(1.25, 0.75, 1);
   }

   40% {
     -webkit-transform: scale3d(0.75, 1.25, 1);
     transform: scale3d(0.75, 1.25, 1);
   }

   50% {
     -webkit-transform: scale3d(1.15, 0.85, 1);
     transform: scale3d(1.15, 0.85, 1);
   }

   65% {
     -webkit-transform: scale3d(.95, 1.05, 1);
     transform: scale3d(.95, 1.05, 1);
   }

   75% {
     -webkit-transform: scale3d(1.05, .95, 1);
     transform: scale3d(1.05, .95, 1);
   }

   100% {
     -webkit-transform: scale3d(1, 1, 1);
     transform: scale3d(1, 1, 1);
   }
 }

 .rubberBand {
   -webkit-animation-name: rubberBand;
   animation-name: rubberBand;
 }

 @-webkit-keyframes shake {

   0%,
   100% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }

   10%,
   30%,
   50%,
   70%,
   90% {
     -webkit-transform: translate3d(-10px, 0, 0);
     transform: translate3d(-10px, 0, 0);
   }

   20%,
   40%,
   60%,
   80% {
     -webkit-transform: translate3d(10px, 0, 0);
     transform: translate3d(10px, 0, 0);
   }
 }

 @keyframes shake {

   0%,
   100% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }

   10%,
   30%,
   50%,
   70%,
   90% {
     -webkit-transform: translate3d(-10px, 0, 0);
     transform: translate3d(-10px, 0, 0);
   }

   20%,
   40%,
   60%,
   80% {
     -webkit-transform: translate3d(10px, 0, 0);
     transform: translate3d(10px, 0, 0);
   }
 }

 .shake {
   -webkit-animation-name: shake;
   animation-name: shake;
 }

 @-webkit-keyframes swing {
   20% {
     -webkit-transform: rotate3d(0, 0, 1, 15deg);
     transform: rotate3d(0, 0, 1, 15deg);
   }

   40% {
     -webkit-transform: rotate3d(0, 0, 1, -10deg);
     transform: rotate3d(0, 0, 1, -10deg);
   }

   60% {
     -webkit-transform: rotate3d(0, 0, 1, 5deg);
     transform: rotate3d(0, 0, 1, 5deg);
   }

   80% {
     -webkit-transform: rotate3d(0, 0, 1, -5deg);
     transform: rotate3d(0, 0, 1, -5deg);
   }

   100% {
     -webkit-transform: rotate3d(0, 0, 1, 0deg);
     transform: rotate3d(0, 0, 1, 0deg);
   }
 }

 @keyframes swing {
   20% {
     -webkit-transform: rotate3d(0, 0, 1, 15deg);
     transform: rotate3d(0, 0, 1, 15deg);
   }

   40% {
     -webkit-transform: rotate3d(0, 0, 1, -10deg);
     transform: rotate3d(0, 0, 1, -10deg);
   }

   60% {
     -webkit-transform: rotate3d(0, 0, 1, 5deg);
     transform: rotate3d(0, 0, 1, 5deg);
   }

   80% {
     -webkit-transform: rotate3d(0, 0, 1, -5deg);
     transform: rotate3d(0, 0, 1, -5deg);
   }

   100% {
     -webkit-transform: rotate3d(0, 0, 1, 0deg);
     transform: rotate3d(0, 0, 1, 0deg);
   }
 }

 .swing {
   -webkit-transform-origin: top center;
   transform-origin: top center;
   -webkit-animation-name: swing;
   animation-name: swing;
 }

 @-webkit-keyframes tada {
   0% {
     -webkit-transform: scale3d(1, 1, 1);
     transform: scale3d(1, 1, 1);
   }

   10%,
   20% {
     -webkit-transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);
     transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);
   }

   30%,
   50%,
   70%,
   90% {
     -webkit-transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);
     transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);
   }

   40%,
   60%,
   80% {
     -webkit-transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);
     transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);
   }

   100% {
     -webkit-transform: scale3d(1, 1, 1);
     transform: scale3d(1, 1, 1);
   }
 }

 @keyframes tada {
   0% {
     -webkit-transform: scale3d(1, 1, 1);
     transform: scale3d(1, 1, 1);
   }

   10%,
   20% {
     -webkit-transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);
     transform: scale3d(.9, .9, .9) rotate3d(0, 0, 1, -3deg);
   }

   30%,
   50%,
   70%,
   90% {
     -webkit-transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);
     transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, 3deg);
   }

   40%,
   60%,
   80% {
     -webkit-transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);
     transform: scale3d(1.1, 1.1, 1.1) rotate3d(0, 0, 1, -3deg);
   }

   100% {
     -webkit-transform: scale3d(1, 1, 1);
     transform: scale3d(1, 1, 1);
   }
 }

 .tada {
   -webkit-animation-name: tada;
   animation-name: tada;
 }

 /* originally authored by Nick Pettit - https://github.com/nickpettit/glide */

 @-webkit-keyframes wobble {
   0% {
     -webkit-transform: none;
     transform: none;
   }

   15% {
     -webkit-transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg);
     transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg);
   }

   30% {
     -webkit-transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg);
     transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg);
   }

   45% {
     -webkit-transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg);
     transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg);
   }

   60% {
     -webkit-transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg);
     transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg);
   }

   75% {
     -webkit-transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg);
     transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg);
   }

   100% {
     -webkit-transform: none;
     transform: none;
   }
 }

 @keyframes wobble {
   0% {
     -webkit-transform: none;
     transform: none;
   }

   15% {
     -webkit-transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg);
     transform: translate3d(-25%, 0, 0) rotate3d(0, 0, 1, -5deg);
   }

   30% {
     -webkit-transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg);
     transform: translate3d(20%, 0, 0) rotate3d(0, 0, 1, 3deg);
   }

   45% {
     -webkit-transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg);
     transform: translate3d(-15%, 0, 0) rotate3d(0, 0, 1, -3deg);
   }

   60% {
     -webkit-transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg);
     transform: translate3d(10%, 0, 0) rotate3d(0, 0, 1, 2deg);
   }

   75% {
     -webkit-transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg);
     transform: translate3d(-5%, 0, 0) rotate3d(0, 0, 1, -1deg);
   }

   100% {
     -webkit-transform: none;
     transform: none;
   }
 }

 .wobble {
   -webkit-animation-name: wobble;
   animation-name: wobble;
 }

 @-webkit-keyframes jello {
   11.1% {
     -webkit-transform: none;
     transform: none;
   }

   22.2% {
     -webkit-transform: skewX(-12.5deg) skewY(-12.5deg);
     transform: skewX(-12.5deg) skewY(-12.5deg);
   }

   33.3% {
     -webkit-transform: skewX(6.25deg) skewY(6.25deg);
     transform: skewX(6.25deg) skewY(6.25deg);
   }

   44.4% {
     -webkit-transform: skewX(-3.125deg) skewY(-3.125deg);
     transform: skewX(-3.125deg) skewY(-3.125deg);
   }

   55.5% {
     -webkit-transform: skewX(1.5625deg) skewY(1.5625deg);
     transform: skewX(1.5625deg) skewY(1.5625deg);
   }

   66.6% {
     -webkit-transform: skewX(-0.78125deg) skewY(-0.78125deg);
     transform: skewX(-0.78125deg) skewY(-0.78125deg);
   }

   77.7% {
     -webkit-transform: skewX(0.390625deg) skewY(0.390625deg);
     transform: skewX(0.390625deg) skewY(0.390625deg);
   }

   88.8% {
     -webkit-transform: skewX(-0.1953125deg) skewY(-0.1953125deg);
     transform: skewX(-0.1953125deg) skewY(-0.1953125deg);
   }

   100% {
     -webkit-transform: none;
     transform: none;
   }
 }

 @keyframes jello {
   11.1% {
     -webkit-transform: none;
     transform: none;
   }

   22.2% {
     -webkit-transform: skewX(-12.5deg) skewY(-12.5deg);
     transform: skewX(-12.5deg) skewY(-12.5deg);
   }

   33.3% {
     -webkit-transform: skewX(6.25deg) skewY(6.25deg);
     transform: skewX(6.25deg) skewY(6.25deg);
   }

   44.4% {
     -webkit-transform: skewX(-3.125deg) skewY(-3.125deg);
     transform: skewX(-3.125deg) skewY(-3.125deg);
   }

   55.5% {
     -webkit-transform: skewX(1.5625deg) skewY(1.5625deg);
     transform: skewX(1.5625deg) skewY(1.5625deg);
   }

   66.6% {
     -webkit-transform: skewX(-0.78125deg) skewY(-0.78125deg);
     transform: skewX(-0.78125deg) skewY(-0.78125deg);
   }

   77.7% {
     -webkit-transform: skewX(0.390625deg) skewY(0.390625deg);
     transform: skewX(0.390625deg) skewY(0.390625deg);
   }

   88.8% {
     -webkit-transform: skewX(-0.1953125deg) skewY(-0.1953125deg);
     transform: skewX(-0.1953125deg) skewY(-0.1953125deg);
   }

   100% {
     -webkit-transform: none;
     transform: none;
   }
 }



 .jello {
   -webkit-animation-name: jello;
   animation-name: jello;
   -webkit-transform-origin: center;
   transform-origin: center;
 }

 @-webkit-keyframes bounceIn {

   0%,
   20%,
   40%,
   60%,
   80%,
   100% {
     -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
     animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
   }

   0% {
     opacity: 0;
     -webkit-transform: scale3d(.3, .3, .3);
     transform: scale3d(.3, .3, .3);
   }

   20% {
     -webkit-transform: scale3d(1.1, 1.1, 1.1);
     transform: scale3d(1.1, 1.1, 1.1);
   }

   40% {
     -webkit-transform: scale3d(.9, .9, .9);
     transform: scale3d(.9, .9, .9);
   }

   60% {
     opacity: 1;
     -webkit-transform: scale3d(1.03, 1.03, 1.03);
     transform: scale3d(1.03, 1.03, 1.03);
   }

   80% {
     -webkit-transform: scale3d(.97, .97, .97);
     transform: scale3d(.97, .97, .97);
   }

   100% {
     opacity: 1;
     -webkit-transform: scale3d(1, 1, 1);
     transform: scale3d(1, 1, 1);
   }
 }

 @keyframes bounceIn {

   0%,
   20%,
   40%,
   60%,
   80%,
   100% {
     -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
     animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
   }

   0% {
     opacity: 0;
     -webkit-transform: scale3d(.3, .3, .3);
     transform: scale3d(.3, .3, .3);
   }

   20% {
     -webkit-transform: scale3d(1.1, 1.1, 1.1);
     transform: scale3d(1.1, 1.1, 1.1);
   }

   40% {
     -webkit-transform: scale3d(.9, .9, .9);
     transform: scale3d(.9, .9, .9);
   }

   60% {
     opacity: 1;
     -webkit-transform: scale3d(1.03, 1.03, 1.03);
     transform: scale3d(1.03, 1.03, 1.03);
   }

   80% {
     -webkit-transform: scale3d(.97, .97, .97);
     transform: scale3d(.97, .97, .97);
   }

   100% {
     opacity: 1;
     -webkit-transform: scale3d(1, 1, 1);
     transform: scale3d(1, 1, 1);
   }
 }

 .bounceIn {
   -webkit-animation-name: bounceIn;
   animation-name: bounceIn;
 }

 @-webkit-keyframes bounceInDown {

   0%,
   60%,
   75%,
   90%,
   100% {
     -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
     animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
   }

   0% {
     opacity: 0;
     -webkit-transform: translate3d(0, -3000px, 0);
     transform: translate3d(0, -3000px, 0);
   }

   60% {
     opacity: 1;
     -webkit-transform: translate3d(0, 25px, 0);
     transform: translate3d(0, 25px, 0);
   }

   75% {
     -webkit-transform: translate3d(0, -10px, 0);
     transform: translate3d(0, -10px, 0);
   }

   90% {
     -webkit-transform: translate3d(0, 5px, 0);
     transform: translate3d(0, 5px, 0);
   }

   100% {
     -webkit-transform: none;
     transform: none;
   }
 }

 @keyframes bounceInDown {

   0%,
   60%,
   75%,
   90%,
   100% {
     -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
     animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
   }

   0% {
     opacity: 0;
     -webkit-transform: translate3d(0, -3000px, 0);
     transform: translate3d(0, -3000px, 0);
   }

   60% {
     opacity: 1;
     -webkit-transform: translate3d(0, 25px, 0);
     transform: translate3d(0, 25px, 0);
   }

   75% {
     -webkit-transform: translate3d(0, -10px, 0);
     transform: translate3d(0, -10px, 0);
   }

   90% {
     -webkit-transform: translate3d(0, 5px, 0);
     transform: translate3d(0, 5px, 0);
   }

   100% {
     -webkit-transform: none;
     transform: none;
   }
 }

 .bounceInDown {
   -webkit-animation-name: bounceInDown;
   animation-name: bounceInDown;
 }

 @-webkit-keyframes bounceInLeft {

   0%,
   60%,
   75%,
   90%,
   100% {
     -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
     animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
   }

   0% {
     opacity: 0;
     -webkit-transform: translate3d(-3000px, 0, 0);
     transform: translate3d(-3000px, 0, 0);
   }

   60% {
     opacity: 1;
     -webkit-transform: translate3d(25px, 0, 0);
     transform: translate3d(25px, 0, 0);
   }

   75% {
     -webkit-transform: translate3d(-10px, 0, 0);
     transform: translate3d(-10px, 0, 0);
   }

   90% {
     -webkit-transform: translate3d(5px, 0, 0);
     transform: translate3d(5px, 0, 0);
   }

   100% {
     -webkit-transform: none;
     transform: none;
   }
 }

 @keyframes bounceInLeft {

   0%,
   60%,
   75%,
   90%,
   100% {
     -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
     animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
   }

   0% {
     opacity: 0;
     -webkit-transform: translate3d(-3000px, 0, 0);
     transform: translate3d(-3000px, 0, 0);
   }

   60% {
     opacity: 1;
     -webkit-transform: translate3d(25px, 0, 0);
     transform: translate3d(25px, 0, 0);
   }

   75% {
     -webkit-transform: translate3d(-10px, 0, 0);
     transform: translate3d(-10px, 0, 0);
   }

   90% {
     -webkit-transform: translate3d(5px, 0, 0);
     transform: translate3d(5px, 0, 0);
   }

   100% {
     -webkit-transform: none;
     transform: none;
   }
 }

 .bounceInLeft {
   -webkit-animation-name: bounceInLeft;
   animation-name: bounceInLeft;
 }

 @-webkit-keyframes bounceInRight {

   0%,
   60%,
   75%,
   90%,
   100% {
     -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
     animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
   }

   0% {
     opacity: 0;
     -webkit-transform: translate3d(3000px, 0, 0);
     transform: translate3d(3000px, 0, 0);
   }

   60% {
     opacity: 1;
     -webkit-transform: translate3d(-25px, 0, 0);
     transform: translate3d(-25px, 0, 0);
   }

   75% {
     -webkit-transform: translate3d(10px, 0, 0);
     transform: translate3d(10px, 0, 0);
   }

   90% {
     -webkit-transform: translate3d(-5px, 0, 0);
     transform: translate3d(-5px, 0, 0);
   }

   100% {
     -webkit-transform: none;
     transform: none;
   }
 }

 @keyframes bounceInRight {

   0%,
   60%,
   75%,
   90%,
   100% {
     -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
     animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
   }

   0% {
     opacity: 0;
     -webkit-transform: translate3d(3000px, 0, 0);
     transform: translate3d(3000px, 0, 0);
   }

   60% {
     opacity: 1;
     -webkit-transform: translate3d(-25px, 0, 0);
     transform: translate3d(-25px, 0, 0);
   }

   75% {
     -webkit-transform: translate3d(10px, 0, 0);
     transform: translate3d(10px, 0, 0);
   }

   90% {
     -webkit-transform: translate3d(-5px, 0, 0);
     transform: translate3d(-5px, 0, 0);
   }

   100% {
     -webkit-transform: none;
     transform: none;
   }
 }

 .bounceInRight {
   -webkit-animation-name: bounceInRight;
   animation-name: bounceInRight;
 }

 @-webkit-keyframes bounceInUp {

   0%,
   60%,
   75%,
   90%,
   100% {
     -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
     animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
   }

   0% {
     opacity: 0;
     -webkit-transform: translate3d(0, 3000px, 0);
     transform: translate3d(0, 3000px, 0);
   }

   60% {
     opacity: 1;
     -webkit-transform: translate3d(0, -20px, 0);
     transform: translate3d(0, -20px, 0);
   }

   75% {
     -webkit-transform: translate3d(0, 10px, 0);
     transform: translate3d(0, 10px, 0);
   }

   90% {
     -webkit-transform: translate3d(0, -5px, 0);
     transform: translate3d(0, -5px, 0);
   }

   100% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }
 }

 @keyframes bounceInUp {

   0%,
   60%,
   75%,
   90%,
   100% {
     -webkit-animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
     animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
   }

   0% {
     opacity: 0;
     -webkit-transform: translate3d(0, 3000px, 0);
     transform: translate3d(0, 3000px, 0);
   }

   60% {
     opacity: 1;
     -webkit-transform: translate3d(0, -20px, 0);
     transform: translate3d(0, -20px, 0);
   }

   75% {
     -webkit-transform: translate3d(0, 10px, 0);
     transform: translate3d(0, 10px, 0);
   }

   90% {
     -webkit-transform: translate3d(0, -5px, 0);
     transform: translate3d(0, -5px, 0);
   }

   100% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }
 }

 .bounceInUp {
   -webkit-animation-name: bounceInUp;
   animation-name: bounceInUp;
 }

 @-webkit-keyframes bounceOut {
   20% {
     -webkit-transform: scale3d(.9, .9, .9);
     transform: scale3d(.9, .9, .9);
   }

   50%,
   55% {
     opacity: 1;
     -webkit-transform: scale3d(1.1, 1.1, 1.1);
     transform: scale3d(1.1, 1.1, 1.1);
   }

   100% {
     opacity: 0;
     -webkit-transform: scale3d(.3, .3, .3);
     transform: scale3d(.3, .3, .3);
   }
 }

 @keyframes bounceOut {
   20% {
     -webkit-transform: scale3d(.9, .9, .9);
     transform: scale3d(.9, .9, .9);
   }

   50%,
   55% {
     opacity: 1;
     -webkit-transform: scale3d(1.1, 1.1, 1.1);
     transform: scale3d(1.1, 1.1, 1.1);
   }

   100% {
     opacity: 0;
     -webkit-transform: scale3d(.3, .3, .3);
     transform: scale3d(.3, .3, .3);
   }
 }

 .bounceOut {
   -webkit-animation-name: bounceOut;
   animation-name: bounceOut;
 }

 @-webkit-keyframes bounceOutDown {
   20% {
     -webkit-transform: translate3d(0, 10px, 0);
     transform: translate3d(0, 10px, 0);
   }

   40%,
   45% {
     opacity: 1;
     -webkit-transform: translate3d(0, -20px, 0);
     transform: translate3d(0, -20px, 0);
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(0, 2000px, 0);
     transform: translate3d(0, 2000px, 0);
   }
 }

 @keyframes bounceOutDown {
   20% {
     -webkit-transform: translate3d(0, 10px, 0);
     transform: translate3d(0, 10px, 0);
   }

   40%,
   45% {
     opacity: 1;
     -webkit-transform: translate3d(0, -20px, 0);
     transform: translate3d(0, -20px, 0);
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(0, 2000px, 0);
     transform: translate3d(0, 2000px, 0);
   }
 }

 .bounceOutDown {
   -webkit-animation-name: bounceOutDown;
   animation-name: bounceOutDown;
 }

 @-webkit-keyframes bounceOutLeft {
   20% {
     opacity: 1;
     -webkit-transform: translate3d(20px, 0, 0);
     transform: translate3d(20px, 0, 0);
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(-2000px, 0, 0);
     transform: translate3d(-2000px, 0, 0);
   }
 }

 @keyframes bounceOutLeft {
   20% {
     opacity: 1;
     -webkit-transform: translate3d(20px, 0, 0);
     transform: translate3d(20px, 0, 0);
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(-2000px, 0, 0);
     transform: translate3d(-2000px, 0, 0);
   }
 }

 .bounceOutLeft {
   -webkit-animation-name: bounceOutLeft;
   animation-name: bounceOutLeft;
 }

 @-webkit-keyframes bounceOutRight {
   20% {
     opacity: 1;
     -webkit-transform: translate3d(-20px, 0, 0);
     transform: translate3d(-20px, 0, 0);
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(2000px, 0, 0);
     transform: translate3d(2000px, 0, 0);
   }
 }

 @keyframes bounceOutRight {
   20% {
     opacity: 1;
     -webkit-transform: translate3d(-20px, 0, 0);
     transform: translate3d(-20px, 0, 0);
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(2000px, 0, 0);
     transform: translate3d(2000px, 0, 0);
   }
 }

 .bounceOutRight {
   -webkit-animation-name: bounceOutRight;
   animation-name: bounceOutRight;
 }

 @-webkit-keyframes bounceOutUp {
   20% {
     -webkit-transform: translate3d(0, -10px, 0);
     transform: translate3d(0, -10px, 0);
   }

   40%,
   45% {
     opacity: 1;
     -webkit-transform: translate3d(0, 20px, 0);
     transform: translate3d(0, 20px, 0);
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(0, -2000px, 0);
     transform: translate3d(0, -2000px, 0);
   }
 }

 @keyframes bounceOutUp {
   20% {
     -webkit-transform: translate3d(0, -10px, 0);
     transform: translate3d(0, -10px, 0);
   }

   40%,
   45% {
     opacity: 1;
     -webkit-transform: translate3d(0, 20px, 0);
     transform: translate3d(0, 20px, 0);
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(0, -2000px, 0);
     transform: translate3d(0, -2000px, 0);
   }
 }

 .bounceOutUp {
   -webkit-animation-name: bounceOutUp;
   animation-name: bounceOutUp;
 }

 @-webkit-keyframes fadeIn {
   0% {
     opacity: 0;
   }

   100% {
     opacity: 1;
   }
 }

 @keyframes fadeIn {
   0% {
     opacity: 0;
   }

   100% {
     opacity: 1;
   }
 }

 .fadeIn {
   -webkit-animation-name: fadeIn;
   animation-name: fadeIn;
 }

 @-webkit-keyframes fadeInDown {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(0, -100%, 0);
     transform: translate3d(0, -100%, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 @keyframes fadeInDown {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(0, -100%, 0);
     transform: translate3d(0, -100%, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 .fadeInDown {
   -webkit-animation-name: fadeInDown;
   animation-name: fadeInDown;
 }

 @-webkit-keyframes fadeInDownBig {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(0, -2000px, 0);
     transform: translate3d(0, -2000px, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 @keyframes fadeInDownBig {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(0, -2000px, 0);
     transform: translate3d(0, -2000px, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 .fadeInDownBig {
   -webkit-animation-name: fadeInDownBig;
   animation-name: fadeInDownBig;
 }

 @-webkit-keyframes fadeInLeft {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(-100%, 0, 0);
     transform: translate3d(-100%, 0, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 @keyframes fadeInLeft {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(-100%, 0, 0);
     transform: translate3d(-100%, 0, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 .fadeInLeft {
   -webkit-animation-name: fadeInLeft;
   animation-name: fadeInLeft;
 }

 @-webkit-keyframes fadeInLeftBig {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(-2000px, 0, 0);
     transform: translate3d(-2000px, 0, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 @keyframes fadeInLeftBig {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(-2000px, 0, 0);
     transform: translate3d(-2000px, 0, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 .fadeInLeftBig {
   -webkit-animation-name: fadeInLeftBig;
   animation-name: fadeInLeftBig;
 }

 @-webkit-keyframes fadeInRight {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(100%, 0, 0);
     transform: translate3d(100%, 0, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 @keyframes fadeInRight {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(100%, 0, 0);
     transform: translate3d(100%, 0, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 .fadeInRight {
   -webkit-animation-name: fadeInRight;
   animation-name: fadeInRight;
 }

 @-webkit-keyframes fadeInRightBig {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(2000px, 0, 0);
     transform: translate3d(2000px, 0, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 @keyframes fadeInRightBig {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(2000px, 0, 0);
     transform: translate3d(2000px, 0, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 .fadeInRightBig {
   -webkit-animation-name: fadeInRightBig;
   animation-name: fadeInRightBig;
 }

 @-webkit-keyframes fadeInUp {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(0, 100%, 0);
     transform: translate3d(0, 100%, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 @keyframes fadeInUp {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(0, 100%, 0);
     transform: translate3d(0, 100%, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 .fadeInUp {
   -webkit-animation-name: fadeInUp;
   animation-name: fadeInUp;
 }

 @-webkit-keyframes fadeInUpBig {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(0, 2000px, 0);
     transform: translate3d(0, 2000px, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 @keyframes fadeInUpBig {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(0, 2000px, 0);
     transform: translate3d(0, 2000px, 0);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 .fadeInUpBig {
   -webkit-animation-name: fadeInUpBig;
   animation-name: fadeInUpBig;
 }

 @-webkit-keyframes fadeOut {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
   }
 }

 @keyframes fadeOut {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
   }
 }

 .fadeOut {
   -webkit-animation-name: fadeOut;
   animation-name: fadeOut;
 }

 @-webkit-keyframes fadeOutDown {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(0, 100%, 0);
     transform: translate3d(0, 100%, 0);
   }
 }

 @keyframes fadeOutDown {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(0, 100%, 0);
     transform: translate3d(0, 100%, 0);
   }
 }

 .fadeOutDown {
   -webkit-animation-name: fadeOutDown;
   animation-name: fadeOutDown;
 }

 @-webkit-keyframes fadeOutDownBig {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(0, 2000px, 0);
     transform: translate3d(0, 2000px, 0);
   }
 }

 @keyframes fadeOutDownBig {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(0, 2000px, 0);
     transform: translate3d(0, 2000px, 0);
   }
 }

 .fadeOutDownBig {
   -webkit-animation-name: fadeOutDownBig;
   animation-name: fadeOutDownBig;
 }

 @-webkit-keyframes fadeOutLeft {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(-100%, 0, 0);
     transform: translate3d(-100%, 0, 0);
   }
 }

 @keyframes fadeOutLeft {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(-100%, 0, 0);
     transform: translate3d(-100%, 0, 0);
   }
 }

 .fadeOutLeft {
   -webkit-animation-name: fadeOutLeft;
   animation-name: fadeOutLeft;
 }

 @-webkit-keyframes fadeOutLeftBig {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(-2000px, 0, 0);
     transform: translate3d(-2000px, 0, 0);
   }
 }

 @keyframes fadeOutLeftBig {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(-2000px, 0, 0);
     transform: translate3d(-2000px, 0, 0);
   }
 }

 .fadeOutLeftBig {
   -webkit-animation-name: fadeOutLeftBig;
   animation-name: fadeOutLeftBig;
 }

 @-webkit-keyframes fadeOutRight {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(100%, 0, 0);
     transform: translate3d(100%, 0, 0);
   }
 }

 @keyframes fadeOutRight {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(100%, 0, 0);
     transform: translate3d(100%, 0, 0);
   }
 }

 .fadeOutRight {
   -webkit-animation-name: fadeOutRight;
   animation-name: fadeOutRight;
 }

 @-webkit-keyframes fadeOutRightBig {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(2000px, 0, 0);
     transform: translate3d(2000px, 0, 0);
   }
 }

 @keyframes fadeOutRightBig {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(2000px, 0, 0);
     transform: translate3d(2000px, 0, 0);
   }
 }

 .fadeOutRightBig {
   -webkit-animation-name: fadeOutRightBig;
   animation-name: fadeOutRightBig;
 }

 @-webkit-keyframes fadeOutUp {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(0, -100%, 0);
     transform: translate3d(0, -100%, 0);
   }
 }

 @keyframes fadeOutUp {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(0, -100%, 0);
     transform: translate3d(0, -100%, 0);
   }
 }

 .fadeOutUp {
   -webkit-animation-name: fadeOutUp;
   animation-name: fadeOutUp;
 }

 @-webkit-keyframes fadeOutUpBig {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(0, -2000px, 0);
     transform: translate3d(0, -2000px, 0);
   }
 }

 @keyframes fadeOutUpBig {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(0, -2000px, 0);
     transform: translate3d(0, -2000px, 0);
   }
 }

 .fadeOutUpBig {
   -webkit-animation-name: fadeOutUpBig;
   animation-name: fadeOutUpBig;
 }

 @-webkit-keyframes flip {
   0% {
     -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -360deg);
     transform: perspective(400px) rotate3d(0, 1, 0, -360deg);
     -webkit-animation-timing-function: ease-out;
     animation-timing-function: ease-out;
   }

   40% {
     -webkit-transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -190deg);
     transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -190deg);
     -webkit-animation-timing-function: ease-out;
     animation-timing-function: ease-out;
   }

   50% {
     -webkit-transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -170deg);
     transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -170deg);
     -webkit-animation-timing-function: ease-in;
     animation-timing-function: ease-in;
   }

   80% {
     -webkit-transform: perspective(400px) scale3d(.95, .95, .95);
     transform: perspective(400px) scale3d(.95, .95, .95);
     -webkit-animation-timing-function: ease-in;
     animation-timing-function: ease-in;
   }

   100% {
     -webkit-transform: perspective(400px);
     transform: perspective(400px);
     -webkit-animation-timing-function: ease-in;
     animation-timing-function: ease-in;
   }
 }

 @keyframes flip {
   0% {
     -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -360deg);
     transform: perspective(400px) rotate3d(0, 1, 0, -360deg);
     -webkit-animation-timing-function: ease-out;
     animation-timing-function: ease-out;
   }

   40% {
     -webkit-transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -190deg);
     transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -190deg);
     -webkit-animation-timing-function: ease-out;
     animation-timing-function: ease-out;
   }

   50% {
     -webkit-transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -170deg);
     transform: perspective(400px) translate3d(0, 0, 150px) rotate3d(0, 1, 0, -170deg);
     -webkit-animation-timing-function: ease-in;
     animation-timing-function: ease-in;
   }

   80% {
     -webkit-transform: perspective(400px) scale3d(.95, .95, .95);
     transform: perspective(400px) scale3d(.95, .95, .95);
     -webkit-animation-timing-function: ease-in;
     animation-timing-function: ease-in;
   }

   100% {
     -webkit-transform: perspective(400px);
     transform: perspective(400px);
     -webkit-animation-timing-function: ease-in;
     animation-timing-function: ease-in;
   }
 }

 .an.flip {
   -webkit-backface-visibility: visible;
   backface-visibility: visible;
   -webkit-animation-name: flip;
   animation-name: flip;
 }

 @-webkit-keyframes flipInX {
   0% {
     -webkit-transform: perspective(400px) rotate3d(1, 0, 0, 90deg);
     transform: perspective(400px) rotate3d(1, 0, 0, 90deg);
     -webkit-animation-timing-function: ease-in;
     animation-timing-function: ease-in;
     opacity: 0;
   }

   40% {
     -webkit-transform: perspective(400px) rotate3d(1, 0, 0, -20deg);
     transform: perspective(400px) rotate3d(1, 0, 0, -20deg);
     -webkit-animation-timing-function: ease-in;
     animation-timing-function: ease-in;
   }

   60% {
     -webkit-transform: perspective(400px) rotate3d(1, 0, 0, 10deg);
     transform: perspective(400px) rotate3d(1, 0, 0, 10deg);
     opacity: 1;
   }

   80% {
     -webkit-transform: perspective(400px) rotate3d(1, 0, 0, -5deg);
     transform: perspective(400px) rotate3d(1, 0, 0, -5deg);
   }

   100% {
     -webkit-transform: perspective(400px);
     transform: perspective(400px);
   }
 }

 @keyframes flipInX {
   0% {
     -webkit-transform: perspective(400px) rotate3d(1, 0, 0, 90deg);
     transform: perspective(400px) rotate3d(1, 0, 0, 90deg);
     -webkit-animation-timing-function: ease-in;
     animation-timing-function: ease-in;
     opacity: 0;
   }



   40% {
     -webkit-transform: perspective(400px) rotate3d(1, 0, 0, -20deg);
     transform: perspective(400px) rotate3d(1, 0, 0, -20deg);
     -webkit-animation-timing-function: ease-in;
     animation-timing-function: ease-in;
   }

   60% {
     -webkit-transform: perspective(400px) rotate3d(1, 0, 0, 10deg);
     transform: perspective(400px) rotate3d(1, 0, 0, 10deg);
     opacity: 1;
   }

   80% {
     -webkit-transform: perspective(400px) rotate3d(1, 0, 0, -5deg);
     transform: perspective(400px) rotate3d(1, 0, 0, -5deg);
   }

   100% {
     -webkit-transform: perspective(400px);
     transform: perspective(400px);
   }
 }

 .flipInX {
   -webkit-backface-visibility: visible !important;
   backface-visibility: visible !important;
   -webkit-animation-name: flipInX;
   animation-name: flipInX;
 }

 @-webkit-keyframes flipInY {
   0% {
     -webkit-transform: perspective(400px) rotate3d(0, 1, 0, 90deg);
     transform: perspective(400px) rotate3d(0, 1, 0, 90deg);
     -webkit-animation-timing-function: ease-in;
     animation-timing-function: ease-in;
     opacity: 0;
   }

   40% {
     -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -20deg);
     transform: perspective(400px) rotate3d(0, 1, 0, -20deg);
     -webkit-animation-timing-function: ease-in;
     animation-timing-function: ease-in;
   }

   60% {
     -webkit-transform: perspective(400px) rotate3d(0, 1, 0, 10deg);
     transform: perspective(400px) rotate3d(0, 1, 0, 10deg);
     opacity: 1;
   }

   80% {
     -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -5deg);
     transform: perspective(400px) rotate3d(0, 1, 0, -5deg);
   }

   100% {
     -webkit-transform: perspective(400px);
     transform: perspective(400px);
   }
 }

 @keyframes flipInY {
   0% {
     -webkit-transform: perspective(400px) rotate3d(0, 1, 0, 90deg);
     transform: perspective(400px) rotate3d(0, 1, 0, 90deg);
     -webkit-animation-timing-function: ease-in;
     animation-timing-function: ease-in;
     opacity: 0;
   }

   40% {
     -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -20deg);
     transform: perspective(400px) rotate3d(0, 1, 0, -20deg);
     -webkit-animation-timing-function: ease-in;
     animation-timing-function: ease-in;
   }

   60% {
     -webkit-transform: perspective(400px) rotate3d(0, 1, 0, 10deg);
     transform: perspective(400px) rotate3d(0, 1, 0, 10deg);
     opacity: 1;
   }

   80% {
     -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -5deg);
     transform: perspective(400px) rotate3d(0, 1, 0, -5deg);
   }

   100% {
     -webkit-transform: perspective(400px);
     transform: perspective(400px);
   }
 }

 .flipInY {
   -webkit-backface-visibility: visible !important;
   backface-visibility: visible !important;
   -webkit-animation-name: flipInY;
   animation-name: flipInY;
 }

 @-webkit-keyframes flipOutX {
   0% {
     -webkit-transform: perspective(400px);
     transform: perspective(400px);
   }

   30% {
     -webkit-transform: perspective(400px) rotate3d(1, 0, 0, -20deg);
     transform: perspective(400px) rotate3d(1, 0, 0, -20deg);
     opacity: 1;
   }

   100% {
     -webkit-transform: perspective(400px) rotate3d(1, 0, 0, 90deg);
     transform: perspective(400px) rotate3d(1, 0, 0, 90deg);
     opacity: 0;
   }
 }

 @keyframes flipOutX {
   0% {
     -webkit-transform: perspective(400px);
     transform: perspective(400px);
   }

   30% {
     -webkit-transform: perspective(400px) rotate3d(1, 0, 0, -20deg);
     transform: perspective(400px) rotate3d(1, 0, 0, -20deg);
     opacity: 1;
   }

   100% {
     -webkit-transform: perspective(400px) rotate3d(1, 0, 0, 90deg);
     transform: perspective(400px) rotate3d(1, 0, 0, 90deg);
     opacity: 0;
   }
 }

 .flipOutX {
   -webkit-animation-name: flipOutX;
   animation-name: flipOutX;
   -webkit-backface-visibility: visible !important;
   backface-visibility: visible !important;
 }

 @-webkit-keyframes flipOutY {
   0% {
     -webkit-transform: perspective(400px);
     transform: perspective(400px);
   }

   30% {
     -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -15deg);
     transform: perspective(400px) rotate3d(0, 1, 0, -15deg);
     opacity: 1;
   }

   100% {
     -webkit-transform: perspective(400px) rotate3d(0, 1, 0, 90deg);
     transform: perspective(400px) rotate3d(0, 1, 0, 90deg);
     opacity: 0;
   }
 }

 @keyframes flipOutY {
   0% {
     -webkit-transform: perspective(400px);
     transform: perspective(400px);
   }

   30% {
     -webkit-transform: perspective(400px) rotate3d(0, 1, 0, -15deg);
     transform: perspective(400px) rotate3d(0, 1, 0, -15deg);
     opacity: 1;
   }

   100% {
     -webkit-transform: perspective(400px) rotate3d(0, 1, 0, 90deg);
     transform: perspective(400px) rotate3d(0, 1, 0, 90deg);
     opacity: 0;
   }
 }

 .flipOutY {
   -webkit-backface-visibility: visible !important;
   backface-visibility: visible !important;
   -webkit-animation-name: flipOutY;
   animation-name: flipOutY;
 }

 @-webkit-keyframes lightSpeedIn {
   0% {
     -webkit-transform: translate3d(100%, 0, 0) skewX(-30deg);
     transform: translate3d(100%, 0, 0) skewX(-30deg);
     opacity: 0;
   }

   60% {
     -webkit-transform: skewX(20deg);
     transform: skewX(20deg);
     opacity: 1;
   }

   80% {
     -webkit-transform: skewX(-5deg);
     transform: skewX(-5deg);
     opacity: 1;
   }

   100% {
     -webkit-transform: none;
     transform: none;
     opacity: 1;
   }
 }

 @keyframes lightSpeedIn {
   0% {
     -webkit-transform: translate3d(100%, 0, 0) skewX(-30deg);
     transform: translate3d(100%, 0, 0) skewX(-30deg);
     opacity: 0;
   }

   60% {
     -webkit-transform: skewX(20deg);
     transform: skewX(20deg);
     opacity: 1;
   }

   80% {
     -webkit-transform: skewX(-5deg);
     transform: skewX(-5deg);
     opacity: 1;
   }

   100% {
     -webkit-transform: none;
     transform: none;
     opacity: 1;
   }
 }

 .lightSpeedIn {
   -webkit-animation-name: lightSpeedIn;
   animation-name: lightSpeedIn;
   -webkit-animation-timing-function: ease-out;
   animation-timing-function: ease-out;
 }

 @-webkit-keyframes lightSpeedOut {
   0% {
     opacity: 1;
   }

   100% {
     -webkit-transform: translate3d(100%, 0, 0) skewX(30deg);
     transform: translate3d(100%, 0, 0) skewX(30deg);
     opacity: 0;
   }
 }

 @keyframes lightSpeedOut {
   0% {
     opacity: 1;
   }

   100% {
     -webkit-transform: translate3d(100%, 0, 0) skewX(30deg);
     transform: translate3d(100%, 0, 0) skewX(30deg);
     opacity: 0;
   }
 }

 .lightSpeedOut {
   -webkit-animation-name: lightSpeedOut;
   animation-name: lightSpeedOut;
   -webkit-animation-timing-function: ease-in;
   animation-timing-function: ease-in;
 }

 @-webkit-keyframes rotateIn {
   0% {
     -webkit-transform-origin: center;
     transform-origin: center;
     -webkit-transform: rotate3d(0, 0, 1, -200deg);
     transform: rotate3d(0, 0, 1, -200deg);
     opacity: 0;
   }

   100% {
     -webkit-transform-origin: center;
     transform-origin: center;
     -webkit-transform: none;
     transform: none;
     opacity: 1;
   }
 }

 @keyframes rotateIn {
   0% {
     -webkit-transform-origin: center;
     transform-origin: center;
     -webkit-transform: rotate3d(0, 0, 1, -200deg);
     transform: rotate3d(0, 0, 1, -200deg);
     opacity: 0;
   }

   100% {
     -webkit-transform-origin: center;
     transform-origin: center;
     -webkit-transform: none;
     transform: none;
     opacity: 1;
   }
 }

 .rotateIn {
   -webkit-animation-name: rotateIn;
   animation-name: rotateIn;
 }

 @-webkit-keyframes rotateInf {
   0% {
     -webkit-transform-origin: center;
     transform-origin: center;
     -webkit-transform: rotate3d(0, 0, 1, -360deg);
     transform: rotate3d(0, 0, 1, -360deg);
     opacity: 0;
   }

   100% {
     -webkit-transform-origin: center;
     transform-origin: center;
     -webkit-transform: none;
     transform: none;
     opacity: 1;
   }
 }



 @-webkit-keyframes rotating-r

 /* Safari and Chrome */
   {
   from {
     -webkit-transform-origin: center;
     transform-origin: center;
     -ms-transform: rotate(0deg);
     -moz-transform: rotate(0deg);
     -webkit-transform: rotate(0deg);
     -o-transform: rotate(0deg);
     transform: rotate(0deg);
   }

   to {
     -webkit-transform-origin: center;
     transform-origin: center;
     -ms-transform: rotate( 360deg);
     -moz-transform: rotate( 360deg);
     -webkit-transform: rotate( 360deg);
     -o-transform: rotate( 360deg);
     transform: rotate( 360deg);
   }
 }

 @keyframes rotating-r {
  from {
    -webkit-transform-origin: center;
    transform-origin: center;
    -ms-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    transform: rotate(0deg);
  }

  to {
    -webkit-transform-origin: center;
    transform-origin: center;
    -ms-transform: rotate( 360deg);
    -moz-transform: rotate( 360deg);
    -webkit-transform: rotate( 360deg);
    -o-transform: rotate( 360deg);
    transform: rotate( 360deg);
  }
}

.rotating-r {
  -webkit-animation: rotating-r 2s linear infinite;
  -moz-animation: rotating-r 2s linear infinite;
  -ms-animation: rotating-r 2s linear infinite;
  -o-animation: rotating-r 2s linear infinite;
  animation: rotating-r 2s linear infinite;
}



 @keyframes rotating {
   from {
     -webkit-transform-origin: center;
     transform-origin: center;
     -ms-transform: rotate(0deg);
     -moz-transform: rotate(0deg);
     -webkit-transform: rotate(0deg);
     -o-transform: rotate(0deg);
     transform: rotate(0deg);
   }

   to {
     -webkit-transform-origin: center;
     transform-origin: center;
     -ms-transform: rotate(-360deg);
     -moz-transform: rotate(-360deg);
     -webkit-transform: rotate(-360deg);
     -o-transform: rotate(-360deg);
     transform: rotate(-360deg);
   }
 }

 .rotating {
   -webkit-animation: rotating 2s linear infinite;
   -moz-animation: rotating 2s linear infinite;
   -ms-animation: rotating 2s linear infinite;
   -o-animation: rotating 2s linear infinite;
   animation: rotating 2s linear infinite;
 }



 @-webkit-keyframes rotateInDownLeft {
   0% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     -webkit-transform: rotate3d(0, 0, 1, -45deg);
     transform: rotate3d(0, 0, 1, -45deg);
     opacity: 0;
   }

   100% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     -webkit-transform: none;
     transform: none;
     opacity: 1;
   }
 }

 @keyframes rotateInDownLeft {
   0% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     -webkit-transform: rotate3d(0, 0, 1, -45deg);
     transform: rotate3d(0, 0, 1, -45deg);
     opacity: 0;
   }

   100% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     -webkit-transform: none;
     transform: none;
     opacity: 1;
   }
 }

 .rotateInDownLeft {
   -webkit-animation-name: rotateInDownLeft;
   animation-name: rotateInDownLeft;
 }

 @-webkit-keyframes rotateInDownRight {
   0% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     -webkit-transform: rotate3d(0, 0, 1, 45deg);
     transform: rotate3d(0, 0, 1, 45deg);
     opacity: 0;
   }

   100% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     -webkit-transform: none;
     transform: none;
     opacity: 1;
   }
 }

 @keyframes rotateInDownRight {
   0% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     -webkit-transform: rotate3d(0, 0, 1, 45deg);
     transform: rotate3d(0, 0, 1, 45deg);
     opacity: 0;
   }

   100% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     -webkit-transform: none;
     transform: none;
     opacity: 1;
   }
 }

 .rotateInDownRight {
   -webkit-animation-name: rotateInDownRight;
   animation-name: rotateInDownRight;
 }

 @-webkit-keyframes rotateInUpLeft {
   0% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     -webkit-transform: rotate3d(0, 0, 1, 45deg);
     transform: rotate3d(0, 0, 1, 45deg);
     opacity: 0;
   }

   100% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     -webkit-transform: none;
     transform: none;
     opacity: 1;
   }
 }

 @keyframes rotateInUpLeft {
   0% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     -webkit-transform: rotate3d(0, 0, 1, 45deg);
     transform: rotate3d(0, 0, 1, 45deg);
     opacity: 0;
   }

   100% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     -webkit-transform: none;
     transform: none;
     opacity: 1;
   }
 }

 .rotateInUpLeft {
   -webkit-animation-name: rotateInUpLeft;
   animation-name: rotateInUpLeft;
 }

 @-webkit-keyframes rotateInUpRight {
   0% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     -webkit-transform: rotate3d(0, 0, 1, -90deg);
     transform: rotate3d(0, 0, 1, -90deg);
     opacity: 0;
   }

   100% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     -webkit-transform: none;
     transform: none;
     opacity: 1;
   }
 }

 @keyframes rotateInUpRight {
   0% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     -webkit-transform: rotate3d(0, 0, 1, -90deg);
     transform: rotate3d(0, 0, 1, -90deg);
     opacity: 0;
   }

   100% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     -webkit-transform: none;
     transform: none;
     opacity: 1;
   }
 }

 .rotateInUpRight {
   -webkit-animation-name: rotateInUpRight;
   animation-name: rotateInUpRight;
 }

 @-webkit-keyframes rotateOut {
   0% {
     -webkit-transform-origin: center;
     transform-origin: center;
     opacity: 1;
   }

   100% {
     -webkit-transform-origin: center;
     transform-origin: center;
     -webkit-transform: rotate3d(0, 0, 1, 200deg);
     transform: rotate3d(0, 0, 1, 200deg);
     opacity: 0;
   }
 }

 @keyframes rotateOut {
   0% {
     -webkit-transform-origin: center;
     transform-origin: center;
     opacity: 1;
   }

   100% {
     -webkit-transform-origin: center;
     transform-origin: center;
     -webkit-transform: rotate3d(0, 0, 1, 200deg);
     transform: rotate3d(0, 0, 1, 200deg);
     opacity: 0;
   }
 }

 .rotateOut {
   -webkit-animation-name: rotateOut;
   animation-name: rotateOut;
 }

 @-webkit-keyframes rotateOutDownLeft {
   0% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     opacity: 1;
   }

   100% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     -webkit-transform: rotate3d(0, 0, 1, 45deg);
     transform: rotate3d(0, 0, 1, 45deg);
     opacity: 0;
   }
 }

 @keyframes rotateOutDownLeft {
   0% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     opacity: 1;
   }

   100% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     -webkit-transform: rotate3d(0, 0, 1, 45deg);
     transform: rotate3d(0, 0, 1, 45deg);
     opacity: 0;
   }
 }

 .rotateOutDownLeft {
   -webkit-animation-name: rotateOutDownLeft;
   animation-name: rotateOutDownLeft;
 }

 @-webkit-keyframes rotateOutDownRight {
   0% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     opacity: 1;
   }

   100% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     -webkit-transform: rotate3d(0, 0, 1, -45deg);
     transform: rotate3d(0, 0, 1, -45deg);
     opacity: 0;
   }
 }

 @keyframes rotateOutDownRight {
   0% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     opacity: 1;
   }

   100% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     -webkit-transform: rotate3d(0, 0, 1, -45deg);
     transform: rotate3d(0, 0, 1, -45deg);
     opacity: 0;
   }
 }

 .rotateOutDownRight {
   -webkit-animation-name: rotateOutDownRight;
   animation-name: rotateOutDownRight;
 }

 @-webkit-keyframes rotateOutUpLeft {
   0% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     opacity: 1;
   }

   100% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     -webkit-transform: rotate3d(0, 0, 1, -45deg);
     transform: rotate3d(0, 0, 1, -45deg);
     opacity: 0;
   }
 }

 @keyframes rotateOutUpLeft {
   0% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     opacity: 1;
   }

   100% {
     -webkit-transform-origin: left bottom;
     transform-origin: left bottom;
     -webkit-transform: rotate3d(0, 0, 1, -45deg);
     transform: rotate3d(0, 0, 1, -45deg);
     opacity: 0;
   }
 }

 .rotateOutUpLeft {
   -webkit-animation-name: rotateOutUpLeft;
   animation-name: rotateOutUpLeft;
 }

 @-webkit-keyframes rotateOutUpRight {
   0% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     opacity: 1;
   }

   100% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     -webkit-transform: rotate3d(0, 0, 1, 90deg);
     transform: rotate3d(0, 0, 1, 90deg);
     opacity: 0;
   }
 }

 @keyframes rotateOutUpRight {
   0% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     opacity: 1;
   }

   100% {
     -webkit-transform-origin: right bottom;
     transform-origin: right bottom;
     -webkit-transform: rotate3d(0, 0, 1, 90deg);
     transform: rotate3d(0, 0, 1, 90deg);
     opacity: 0;
   }
 }

 .rotateOutUpRight {
   -webkit-animation-name: rotateOutUpRight;
   animation-name: rotateOutUpRight;
 }

 @-webkit-keyframes hinge {
   0% {
     -webkit-transform-origin: top left;
     transform-origin: top left;
     -webkit-animation-timing-function: ease-in-out;
     animation-timing-function: ease-in-out;
   }

   20%,
   60% {
     -webkit-transform: rotate3d(0, 0, 1, 80deg);
     transform: rotate3d(0, 0, 1, 80deg);
     -webkit-transform-origin: top left;
     transform-origin: top left;
     -webkit-animation-timing-function: ease-in-out;
     animation-timing-function: ease-in-out;
   }

   40%,
   80% {
     -webkit-transform: rotate3d(0, 0, 1, 60deg);
     transform: rotate3d(0, 0, 1, 60deg);
     -webkit-transform-origin: top left;
     transform-origin: top left;
     -webkit-animation-timing-function: ease-in-out;
     animation-timing-function: ease-in-out;
     opacity: 1;
   }

   100% {
     -webkit-transform: translate3d(0, 700px, 0);
     transform: translate3d(0, 700px, 0);
     opacity: 0;
   }
 }

 @keyframes hinge {
   0% {
     -webkit-transform-origin: top left;
     transform-origin: top left;
     -webkit-animation-timing-function: ease-in-out;
     animation-timing-function: ease-in-out;
   }

   20%,
   60% {
     -webkit-transform: rotate3d(0, 0, 1, 80deg);
     transform: rotate3d(0, 0, 1, 80deg);
     -webkit-transform-origin: top left;
     transform-origin: top left;
     -webkit-animation-timing-function: ease-in-out;
     animation-timing-function: ease-in-out;
   }

   40%,
   80% {
     -webkit-transform: rotate3d(0, 0, 1, 60deg);
     transform: rotate3d(0, 0, 1, 60deg);
     -webkit-transform-origin: top left;
     transform-origin: top left;
     -webkit-animation-timing-function: ease-in-out;
     animation-timing-function: ease-in-out;
     opacity: 1;
   }

   100% {
     -webkit-transform: translate3d(0, 700px, 0);
     transform: translate3d(0, 700px, 0);
     opacity: 0;
   }
 }

 .hinge {
   -webkit-animation-name: hinge;
   animation-name: hinge;
 }

 /* originally authored by Nick Pettit - https://github.com/nickpettit/glide */

 @-webkit-keyframes rollIn {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(-100%, 0, 0) rotate3d(0, 0, 1, -120deg);
     transform: translate3d(-100%, 0, 0) rotate3d(0, 0, 1, -120deg);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 @keyframes rollIn {
   0% {
     opacity: 0;
     -webkit-transform: translate3d(-100%, 0, 0) rotate3d(0, 0, 1, -120deg);
     transform: translate3d(-100%, 0, 0) rotate3d(0, 0, 1, -120deg);
   }

   100% {
     opacity: 1;
     -webkit-transform: none;
     transform: none;
   }
 }

 .rollIn {
   -webkit-animation-name: rollIn;
   animation-name: rollIn;
 }

 /* originally authored by Nick Pettit - https://github.com/nickpettit/glide */

 @-webkit-keyframes rollOut {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(100%, 0, 0) rotate3d(0, 0, 1, 120deg);
     transform: translate3d(100%, 0, 0) rotate3d(0, 0, 1, 120deg);
   }
 }

 @keyframes rollOut {
   0% {
     opacity: 1;
   }

   100% {
     opacity: 0;
     -webkit-transform: translate3d(100%, 0, 0) rotate3d(0, 0, 1, 120deg);
     transform: translate3d(100%, 0, 0) rotate3d(0, 0, 1, 120deg);
   }
 }

 .rollOut {
   -webkit-animation-name: rollOut;
   animation-name: rollOut;
 }

 @-webkit-keyframes zoomIn {
   0% {
     opacity: 0;
     -webkit-transform: scale3d(.3, .3, .3);
     transform: scale3d(.3, .3, .3);
   }

   50% {
     opacity: 1;
   }
 }

 @keyframes zoomIn {
   0% {
     opacity: 0;
     -webkit-transform: scale3d(.3, .3, .3);
     transform: scale3d(.3, .3, .3);
   }

   50% {
     opacity: 1;
   }
 }

 .zoomIn {
   -webkit-animation-name: zoomIn;
   animation-name: zoomIn;
 }

 @-webkit-keyframes zoomInDown {
   0% {
     opacity: 0;
     -webkit-transform: scale3d(.1, .1, .1) translate3d(0, -1000px, 0);
     transform: scale3d(.1, .1, .1) translate3d(0, -1000px, 0);
     -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
     animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
   }

   60% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);
     transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);
     -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
     animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
   }
 }

 @keyframes zoomInDown {
   0% {
     opacity: 0;
     -webkit-transform: scale3d(.1, .1, .1) translate3d(0, -1000px, 0);
     transform: scale3d(.1, .1, .1) translate3d(0, -1000px, 0);
     -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
     animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
   }

   60% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);
     transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);
     -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
     animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
   }
 }

 .zoomInDown {
   -webkit-animation-name: zoomInDown;
   animation-name: zoomInDown;
 }

 @-webkit-keyframes zoomInLeft {
   0% {
     opacity: 0;
     -webkit-transform: scale3d(.1, .1, .1) translate3d(-1000px, 0, 0);
     transform: scale3d(.1, .1, .1) translate3d(-1000px, 0, 0);
     -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
     animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
   }

   60% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(10px, 0, 0);
     transform: scale3d(.475, .475, .475) translate3d(10px, 0, 0);
     -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
     animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
   }
 }

 @keyframes zoomInLeft {
   0% {
     opacity: 0;
     -webkit-transform: scale3d(.1, .1, .1) translate3d(-1000px, 0, 0);
     transform: scale3d(.1, .1, .1) translate3d(-1000px, 0, 0);
     -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
     animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
   }

   60% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(10px, 0, 0);
     transform: scale3d(.475, .475, .475) translate3d(10px, 0, 0);
     -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
     animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
   }
 }

 .zoomInLeft {
   -webkit-animation-name: zoomInLeft;
   animation-name: zoomInLeft;
 }

 @-webkit-keyframes zoomInRight {
   0% {
     opacity: 0;
     -webkit-transform: scale3d(.1, .1, .1) translate3d(1000px, 0, 0);
     transform: scale3d(.1, .1, .1) translate3d(1000px, 0, 0);
     -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
     animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
   }

   60% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(-10px, 0, 0);
     transform: scale3d(.475, .475, .475) translate3d(-10px, 0, 0);
     -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
     animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
   }
 }

 @keyframes zoomInRight {
   0% {
     opacity: 0;
     -webkit-transform: scale3d(.1, .1, .1) translate3d(1000px, 0, 0);
     transform: scale3d(.1, .1, .1) translate3d(1000px, 0, 0);
     -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
     animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
   }

   60% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(-10px, 0, 0);
     transform: scale3d(.475, .475, .475) translate3d(-10px, 0, 0);
     -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
     animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
   }
 }

 .zoomInRight {
   -webkit-animation-name: zoomInRight;
   animation-name: zoomInRight;
 }

 @-webkit-keyframes zoomInUp {
   0% {
     opacity: 0;
     -webkit-transform: scale3d(.1, .1, .1) translate3d(0, 1000px, 0);
     transform: scale3d(.1, .1, .1) translate3d(0, 1000px, 0);
     -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
     animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
   }

   60% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);
     transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);
     -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
     animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
   }
 }

 @keyframes zoomInUp {
   0% {
     opacity: 0;
     -webkit-transform: scale3d(.1, .1, .1) translate3d(0, 1000px, 0);
     transform: scale3d(.1, .1, .1) translate3d(0, 1000px, 0);
     -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
     animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
   }

   60% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);
     transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);
     -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
     animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
   }
 }

 .zoomInUp {
   -webkit-animation-name: zoomInUp;
   animation-name: zoomInUp;
 }

 @-webkit-keyframes zoomOut {
   0% {
     opacity: 1;
   }

   50% {
     opacity: 0;
     -webkit-transform: scale3d(.3, .3, .3);
     transform: scale3d(.3, .3, .3);
   }

   100% {
     opacity: 0;
   }
 }

 @keyframes zoomOut {
   0% {
     opacity: 1;
   }

   50% {
     opacity: 0;
     -webkit-transform: scale3d(.3, .3, .3);
     transform: scale3d(.3, .3, .3);
   }

   100% {
     opacity: 0;
   }
 }

 .zoomOut {
   -webkit-animation-name: zoomOut;
   animation-name: zoomOut;
 }

 @-webkit-keyframes zoomOutDown {
   40% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);
     transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);
     -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
     animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
   }

   100% {
     opacity: 0;
     -webkit-transform: scale3d(.1, .1, .1) translate3d(0, 2000px, 0);
     transform: scale3d(.1, .1, .1) translate3d(0, 2000px, 0);
     -webkit-transform-origin: center bottom;
     transform-origin: center bottom;
     -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
     animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
   }
 }

 @keyframes zoomOutDown {
   40% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);
     transform: scale3d(.475, .475, .475) translate3d(0, -60px, 0);
     -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
     animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
   }

   100% {
     opacity: 0;
     -webkit-transform: scale3d(.1, .1, .1) translate3d(0, 2000px, 0);
     transform: scale3d(.1, .1, .1) translate3d(0, 2000px, 0);
     -webkit-transform-origin: center bottom;
     transform-origin: center bottom;
     -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
     animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
   }
 }

 .zoomOutDown {
   -webkit-animation-name: zoomOutDown;
   animation-name: zoomOutDown;
 }

 @-webkit-keyframes zoomOutLeft {
   40% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(42px, 0, 0);
     transform: scale3d(.475, .475, .475) translate3d(42px, 0, 0);
   }

   100% {
     opacity: 0;
     -webkit-transform: scale(.1) translate3d(-2000px, 0, 0);
     transform: scale(.1) translate3d(-2000px, 0, 0);
     -webkit-transform-origin: left center;
     transform-origin: left center;
   }
 }

 @keyframes zoomOutLeft {
   40% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(42px, 0, 0);
     transform: scale3d(.475, .475, .475) translate3d(42px, 0, 0);
   }

   100% {
     opacity: 0;
     -webkit-transform: scale(.1) translate3d(-2000px, 0, 0);
     transform: scale(.1) translate3d(-2000px, 0, 0);
     -webkit-transform-origin: left center;
     transform-origin: left center;
   }
 }

 .zoomOutLeft {
   -webkit-animation-name: zoomOutLeft;
   animation-name: zoomOutLeft;
 }

 @-webkit-keyframes zoomOutRight {
   40% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(-42px, 0, 0);
     transform: scale3d(.475, .475, .475) translate3d(-42px, 0, 0);
   }

   100% {
     opacity: 0;
     -webkit-transform: scale(.1) translate3d(2000px, 0, 0);
     transform: scale(.1) translate3d(2000px, 0, 0);
     -webkit-transform-origin: right center;
     transform-origin: right center;
   }
 }

 @keyframes zoomOutRight {
   40% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(-42px, 0, 0);
     transform: scale3d(.475, .475, .475) translate3d(-42px, 0, 0);
   }

   100% {
     opacity: 0;
     -webkit-transform: scale(.1) translate3d(2000px, 0, 0);
     transform: scale(.1) translate3d(2000px, 0, 0);
     -webkit-transform-origin: right center;
     transform-origin: right center;
   }
 }

 .zoomOutRight {
   -webkit-animation-name: zoomOutRight;
   animation-name: zoomOutRight;
 }

 @-webkit-keyframes zoomOutUp {
   40% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);
     transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);
     -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
     animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
   }

   100% {
     opacity: 0;
     -webkit-transform: scale3d(.1, .1, .1) translate3d(0, -2000px, 0);
     transform: scale3d(.1, .1, .1) translate3d(0, -2000px, 0);
     -webkit-transform-origin: center bottom;
     transform-origin: center bottom;
     -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
     animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
   }
 }

 @keyframes zoomOutUp {
   40% {
     opacity: 1;
     -webkit-transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);
     transform: scale3d(.475, .475, .475) translate3d(0, 60px, 0);
     -webkit-animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
     animation-timing-function: cubic-bezier(0.550, 0.055, 0.675, 0.190);
   }

   100% {
     opacity: 0;
     -webkit-transform: scale3d(.1, .1, .1) translate3d(0, -2000px, 0);
     transform: scale3d(.1, .1, .1) translate3d(0, -2000px, 0);
     -webkit-transform-origin: center bottom;
     transform-origin: center bottom;
     -webkit-animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
     animation-timing-function: cubic-bezier(0.175, 0.885, 0.320, 1);
   }
 }

 .zoomOutUp {
   -webkit-animation-name: zoomOutUp;
   animation-name: zoomOutUp;
 }

 @-webkit-keyframes slideInDown {
   0% {
     -webkit-transform: translate3d(0, -100%, 0);
     transform: translate3d(0, -100%, 0);
     visibility: visible;
   }

   100% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }
 }

 @keyframes slideInDown {
   0% {
     -webkit-transform: translate3d(0, -100%, 0);
     transform: translate3d(0, -100%, 0);
     visibility: visible;
   }

   100% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }
 }

 .slideInDown {
   -webkit-animation-name: slideInDown;
   animation-name: slideInDown;
 }

 @-webkit-keyframes slideInLeft {
   0% {
     -webkit-transform: translate3d(-100%, 0, 0);
     transform: translate3d(-100%, 0, 0);
     visibility: visible;
   }

   100% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }
 }

 @keyframes slideInLeft {
   0% {
     -webkit-transform: translate3d(-100%, 0, 0);
     transform: translate3d(-100%, 0, 0);
     visibility: visible;
   }

   100% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }
 }

 .slideInLeft {
   -webkit-animation-name: slideInLeft;
   animation-name: slideInLeft;
 }

 @-webkit-keyframes slideInRight {
   0% {
     -webkit-transform: translate3d(100%, 0, 0);
     transform: translate3d(100%, 0, 0);
     visibility: visible;
   }

   100% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }
 }

 @keyframes slideInRight {
   0% {
     -webkit-transform: translate3d(100%, 0, 0);
     transform: translate3d(100%, 0, 0);
     visibility: visible;
   }

   100% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }
 }

 .slideInRight {
   -webkit-animation-name: slideInRight;
   animation-name: slideInRight;
 }

 @-webkit-keyframes slideInUp {
   0% {
     -webkit-transform: translate3d(0, 100%, 0);
     transform: translate3d(0, 100%, 0);
     visibility: visible;
   }

   100% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }
 }

 @keyframes slideInUp {
   0% {
     -webkit-transform: translate3d(0, 100%, 0);
     transform: translate3d(0, 100%, 0);
     visibility: visible;
   }

   100% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }
 }

 .slideInUp {
   -webkit-animation-name: slideInUp;
   animation-name: slideInUp;
 }

 @-webkit-keyframes slideOutDown {
   0% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }

   100% {
     visibility: hidden;
     -webkit-transform: translate3d(0, 100%, 0);
     transform: translate3d(0, 100%, 0);
   }
 }

 @keyframes slideOutDown {
   0% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }

   100% {
     visibility: hidden;
     -webkit-transform: translate3d(0, 100%, 0);
     transform: translate3d(0, 100%, 0);
   }
 }

 .slideOutDown {
   -webkit-animation-name: slideOutDown;
   animation-name: slideOutDown;
 }

 @-webkit-keyframes slideOutLeft {
   0% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }

   100% {
     visibility: hidden;
     -webkit-transform: translate3d(-100%, 0, 0);
     transform: translate3d(-100%, 0, 0);
   }
 }

 @keyframes slideOutLeft {
   0% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }

   100% {
     visibility: hidden;
     -webkit-transform: translate3d(-100%, 0, 0);
     transform: translate3d(-100%, 0, 0);
   }
 }

 .slideOutLeft {
   -webkit-animation-name: slideOutLeft;
   animation-name: slideOutLeft;
 }



 @-webkit-keyframes slideOutRight {
   0% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }

   100% {
     visibility: hidden;
     -webkit-transform: translate3d(100%, 0, 0);
     transform: translate3d(100%, 0, 0);
   }
 }

 @keyframes slideOutRight {
   0% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }

   100% {
     visibility: hidden;
     -webkit-transform: translate3d(100%, 0, 0);
     transform: translate3d(100%, 0, 0);
   }
 }

 .slideOutRight {
   -webkit-animation-name: slideOutRight;
   animation-name: slideOutRight;
 }

 @-webkit-keyframes slideOutUp {
   0% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }

   100% {
     visibility: hidden;
     -webkit-transform: translate3d(0, -100%, 0);
     transform: translate3d(0, -100%, 0);
   }
 }

 @keyframes slideOutUp {
   0% {
     -webkit-transform: translate3d(0, 0, 0);
     transform: translate3d(0, 0, 0);
   }

   100% {
     visibility: hidden;
     -webkit-transform: translate3d(0, -100%, 0);
     transform: translate3d(0, -100%, 0);
   }
 }

 .slideOutUp {
   -webkit-animation-name: slideOutUp;
   animation-name: slideOutUp;
 }

 /*#region customize */


 @-webkit-keyframes rotate3 {


   100% {
     -webkit-transform: rotate(360deg);
     transform: rotate(360deg);
   }
 }

 @keyframes rotate3 {

   100% {
     -webkit-transform: rotate(360deg);
     transform: rotate(360deg);
   }
 }

 .rotate3 {
   -webkit-animation-name: rotate3;
   animation-name: rotate3;
 }


 @-webkit-keyframes rotate4 {


   100% {
     -webkit-transform: rotate(-360deg);
     transform: rotate(-360deg);
   }
 }

 @keyframes rotate4 {

   100% {
     -webkit-transform: rotate(-360deg);
     transform: rotate(-360deg);
   }
 }

 .rotate4 {
   -webkit-animation-name: rotate4;
   animation-name: rotate4;
 }

    `;
  },
  nasted: function () {
    return `
 
  html,
        body,
        *,
        div {
          
            font-family: 'Helvetica';
        }

        

        .full {
            top: 0%;
            left: 0%;
            width: 100%;
            height: 100%;
        }

        .relative {
            position: relative;
        }

        .absolute {
            position: absolute;
        }

        .fixed {
            position: fixed;
        }
    

    .prevent-select {
        -webkit-user-select: none; /* Safari */
        -ms-user-select: none; /* IE 10 and IE 11 */
        user-select: none; /* Standard syntax */
      }

    canvas  {    
      outline : none !important;
    }

    .draged{
     
    }
    .draged *{
       
    }

     notValid {
      display:none;
    }

    .notValid notValid {
      display:block !important;
    }
      .notValid valid {
      display:none !important;
    }

     .valid notValid {
      display:none !important;
    }
      .valid valid {
      display:block !important;
    }
      
      
 .no-out  { outline : none !important}

 .ns   .sub,
 .ns   .sub-f {
   display: none;
 }
 
 

 .ns:hover .sub,
 .ns:focus .sub {
   display: block;
 }

 

 .ns:hover .sub-f,
 .ns:focus .sub-f {
   display: -webkit-box;
   display: -moz-box;
   display: -ms-flexbox;
   display: -webkit-flex;
   display: flex;
 }

     @keyframes v3load {
            100% {
                left: -68.5%;
            }

            0% {
                left: -40%;
            }
        }



        V3LOADING,
        .v3 {

            display: block;
            position: absolute;
            text-align: center;
            z-index: 999;
            left: 0%;
            width: 100%;
            height: 100%;
            top: 50%;
        }

        V3LOADING>span {
            color: #1360a83d;
            font-size: 35px;
            font-family: Helvetica bold;
            font-weight: 100;


            width: 66px;
            position: relative;
        }

        V3LOADING>span .v1::after {
            content: '/////////////////';
            border-radius: 5px;
            left: 0px;
            position: relative;
            animation: linear infinite;
            animation-name: v3load;
            animation-duration: 2s;
        }

        V3LOADING>span .v1 {

            position: relative;

            left: calc(50% - 50px);
            height: 55px;

            overflow: hidden;
            max-width: 100px;
        }

        V3LOADING>span .v3 {
            color: #1462ab;
            position: relative;
            top:  -14px;
            font-size: 12px;
            font-weight: 700;
            z-index: 15;
        }  

        V3LOADING>span .info {
            position: fixed;
            color: #1462ab99;
            bottom: 30px;
            width: 100%;
            font-size: 13px;
        }

        V3LOADING .v1 .progress {
            position: absolute;
            left: 0px;
            width: 0%;
            height: 17px;
            bottom: calc( 0%   );
            overflow: hidden;
            background-color: #1462ab;
            border-radius: 2px;

        }

        V3LOADING .v1 .progress div {
            color: #ffffff;
            position: relative;
            top: 2px;
            font-size: 12px;
            font-weight: 700;
            z-index: 130;
        }

 
  `;
  },
  overflow: function () {

    return `
 .owf {
   overflow: hidden;
 }

 .owf-x {
   overflow-x: hidden;
 }

 .owf-y {
   overflow-y: hidden;
 }
`;

  },
  hidden: function () {
    return `



     input[type="file"] { cursor: pointer !important; }

 .hdn {
   display: none;
 }
 
 *[disable],.disabled {
  -webkit-user-select: none;  
  -ms-user-select: none;  
  user-select: none;  
  opacity:0.5;
  filter: grayscale(60%);
   pointer-events: none !important;
 }
 


 .hdn-i {
   display: none !important;
 }
   
 `;
  },
  icon: function () {
    return `
       .icon { 
          font-family: 'Material Symbols Outlined' !important;
          font-weight: normal;
          font-style: normal;
          display: inline-block;
          line-height: 1;
          text-transform: none;
          letter-spacing: normal;
          word-wrap: normal;
          white-space: nowrap;
          direction: ltr;
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
          -moz-osx-font-smoothing: grayscale;
          font-feature-settings: 'liga';
      }
    `;
  },

  helpers: {
    show: function (css, estimate) {
      _dy.element(css).classList.remove('hdn-i');
      if (estimate)
        setTimeout(() => {
          _dy.element(css).classList.add('hdn-i');
        }, estimate);
    },
    hide: function (css, estimate) {
      if (estimate)
        setTimeout(() => {
          _dy.element(css).classList.remove('hdn-i');
        }, estimate);
      else _dy.element(css).classList.add('hdn-i');

    },

  }

};

window._dyStyle = dyStyle._prototype;



export default {
  main: dyStyle._prototype
};