
export function dy() { };
dy.prototype = {
  init: function (ins, ins2) {
    window.eval(`function def(n,r){return void 0!=n&&null!=n?n:void 0!=r&&null!=r?r:null} var floor=Math.floor,sin=Math.sin,cos=Math.cos,tan=Math.tan,atan=Math.atan,atan2=Math.atan2,asin=Math.asin,acos=Math.acos,pow=function(n,r){return Math.pow(n,r||2)},ceil=Math.ceil,abs=Math.abs,exp=Math.exp,log=Math.log,max=Math.max,min=Math.min,sqrt=Math.sqrt,random=Math.random,round=Math.round,sqrt=Math.sqrt,sign=Math.sign,PI=Math.PI,E=Math.E,deg=PI/180,rad=180/PI;`);

    String.prototype.trim = function () { return this.replace(/^\s+|\s+$/gm, ""); };
    String.prototype.replaceAll = function (n, r, a) { return this.replace(RegExp(n.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g, "\\$&"), a ? "gi" : "g"), "string" == typeof r ? r.replace(/\$/g, "$$$$") : r); };
    window._dy = ins;
    window._dyScript = ins2;

    console.log("iiiiiii%c!!!!!!!! !!!!!!i!! ^..!!!!!!  / |!!  i!!  ^.!!!!!! /| |!!  i!!  ^.   ..    ^..!!| |!!  i     ^^.    ..   ^.!! | |!!! i   ^^^     .. ^.!!  | |!!  i   ^^^!!^..!!   | |!!  i     ^^.!!^.!! versIon2!!i!!!!    ^..!!!!!!!   i!!!!!!!! !!!!!!iiiiii".replaceAll("^", "...").replaceAll("!!", "      ").replaceAll("!!", "      ").replaceAll('!', ' ').replaceAll('i', '\n').replaceAll('I', 'i').replaceAll(".", "0"), ' color:rgba(13, 107, 179, 1)');
  },
  paste: async function (f) {
    var v = await navigator.clipboard.readText();
    f(v);
  },
  to_raw: function (d) {
    return d.replaceAll('"', '____qt').replaceAll("'", '____t').replaceAll('`', '____st');
  },

  address: function (r, d) {
    var ds = d.split('.');
    if (ds.length == 2)
      return r[ds[0]][ds[1]];
    else if (ds.length == 3)
      return r[ds[0]][ds[1]][ds[2]];
    else if (ds.length == 4)
      return r[ds[0]][ds[1]][ds[2]][ds[3]];
    else r[d];
  },

  imageFileUploader: function (fileInp, prg, result) {

    const file = event.target.files[0];

    fileInp.parentNode.classList.add('disabled');

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        // Convert ArrayBuffer to Base64
        const arrayBuffer = reader.result;

        var raw_content = arrayBuffer;

        var blob = new Blob([raw_content]);

        var binary = '';
        var bytes = new Uint8Array(arrayBuffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }

        var base64String = btoa(binary);

        if (result) result.src = 'data:image/png;base64,' + base64String;
        if (result) result.classList.add('op-05');

        if (prg) prg.style.width = '0%';
        if (_dy.imageUploader) _dy.imageUploader({ file: file, blob: blob, base64: base64String, input: fileInp, prg: prg, output: result });
        else fileInp.parentNode.classList.remove('disabled');
      };

      reader.readAsArrayBuffer(file);
    }


  },

  toHash: function (value, i) {

    var hash = btoa(value.replaceAll('.', '_').replaceAll(' ', '_').replaceAll('-', '_'))
      .replaceAll('.', '').replaceAll('+', '').replaceAll('=', '');

    return hash;
  },

  element: function (s, p) {
    p = def(p, document);

    var sub = '';
    if (s.indexOf('->') != -1) { sub = s.split('->')[1]; s = s.split('->')[0]; }
    try {
      var rl = p.querySelector(s);
    } catch (e) {
      console.log(e, s, p);
      return null;
    }
    return (sub == '' ? rl : rl[sub]);
  },
  get: function (tid) {
    return _dy.temp_object[tid];
  },

  select: async function (all, sel, add, rem, p, tg) {
    var stt = false;

    var el = _dy.element(sel, p);
    var isSelected = el && el.className.indexOf(add[0]) != -1;
    stt = await _dy.elements(all, function (at) {

      if (at && at.classList) {

        if (rem)
          for (var i in rem) {
            at.classList.add(rem[i]);
          }
        if (add)
          for (var i in add) {
            at.classList.remove(add[i]);
          }
      }
    }, function () {



      if (tg && isSelected) {


        if (rem)
          for (var i in rem) {
            el.classList.add(rem[i]);
          }
        if (add)
          for (var i in add) {
            el.classList.remove(add[i]);
          }

        stt = false;


        return stt;
      } else if (el) {
        if (rem)
          for (var i in rem) {

            el.classList.remove(rem[i]);
          }
        if (add)
          for (var i in add) {
            el.classList.add(add[i]);
          }

        stt = true;
        return stt;
      }
    }, null, p);
    return stt;
  },

  filter: function (l, f) {
    var ls = [];
    var _i = 0;
    for (var i in l) {
      if (f(l[i], i)) {
        _i++;
        l[i].dy_index = i;
        l[i].ls_index = _i;
        ls.push(l[i]);
      }
    }
    return ls;
  },
  selectMuli: function (sel, add, rem, p) {
    var el = _dy.element(sel, p);
    if (rem)
      for (var i in rem) {
        el.classList.add(rem[i]);
      }
    if (add)
      for (var i in add) {
        el.classList.remove(add[i]);
      }
  },


  last_element: function (s, f, p) {
    p = def(p, document);
    var rl = p.querySelectorAll(s);

    if (!def(f)) return rl[rl.length - 1];
    if (rl.length > 0) f(rl[rl.length - 1]);
  },
  generateCssColor: function (th, key, value, parent) {
    var el;
    if (!document.getElementById('special_dy_style_' + key)) {
      el = document.createElement('style');
      th.parentNode.parentNode.appendChild(el);
    } else { el = document.getElementById('special_dy_style_' + key); }
    el.id = 'special_dy_style_' + key;
    el.innerHTML = (parent ? parent + ' ' : '') + ` .` + key + ` { 
       ` + value + (parent ? ' !important' : '') + `; 
    } `;

  },
  /**  
   * 
   *   [query]->[name]|[sub]~[property name],[name]|[sub]~#[attribute name],[property name],#[attribute name]
   *   [query]->[name]|[sub]>>[property name] 
   * 
   */
  elements: async function (s, f, e, b, p) {

    var sub = '';
    if (s.indexOf('->') != -1) { sub = s.split('->')[1].split(','); s = s.split('->')[0]; }
    p = def(p, document);
    var rl = p.querySelectorAll(s);
    if (b) return b(rl);
    var vals = [];
    for (var r in rl) {
      if (rl[r] && rl[r].classList && sub != '') {
        var vl = {};
        for (var j in sub) {

          if (sub[j].indexOf('>>') != -1) {

            var val = await _dy.elements(sub[j].replace('>>', '->').split('|')[1], null, null, null, rl[r]);

            var ky = sub[j].split('>>')[0].split('|')[0];
            if (ky.indexOf('.') != -1) {
              if (!vl[ky.split('.')[0]]) vl[ky.split('.')[0]] = [];
              for (var iv in val) {

                if (!vl[ky.split('.')[0]][iv]) vl[ky.split('.')[0]][iv] = {};
                vl[ky.split('.')[0]][iv][ky.split('.')[1]] = val[iv];
              }

            }
            else {
              if (!vl[ky]) vl[ky] = [];
              for (var iv in val) {
                if (!vl[ky][iv]) vl[ky][iv] = {};
                for (var ivs in val[iv]) {
                  vl[ky][iv][ivs] = val[iv][ivs];
                }
              }

            }

          } else if (sub[j].indexOf('~') != -1) {

            var val = await _dy.elements(sub[j].replace('~', '->').split('|')[1], null, null, null, rl[r]);

            if (!vl[sub[j].split('~')[0].split('|')[0]]) vl[sub[j].split('~')[0].split('|')[0]] = {};

            for (var iv in val[0]) {


              vl[sub[j].split('~')[0].split('|')[0]] = val[0][iv];
            }

          }
          else if (sub[j].startsWith('#')) {

            var pref = sub[j];
            var eref = rl[r];


            if (pref.indexOf && pref.indexOf('parent.') != -1)
              for (var mi = 0; mi < 5; mi++) {

                if (pref.replace('#', '').startsWith('parent.')) {
                  eref = eref.parentNode;

                  pref = pref.replace('parent.', '');
                }
              }


            if (pref.replace('#', '').startsWith('prop.')) {
              vl[pref.replace('#', '')] = (eref[pref.replace('#', '').replace('prop.', '')]);

            } else if (pref.replace('#', '') == 'innerHTML') {
              vl[pref.replace('#', '')] = (eref.innerHTML ? btoa(eref.innerHTML) : null);

            } else if (pref.replace('#', '') == 'outerHTML') {
              vl[pref.replace('#', '')] = (eref.outerHTML ? btoa(eref.outerHTML) : null);

            } else if (pref.replace('#', '') == 'innerText') {
              vl[pref.replace('#', '')] = (eref.innerText ? eref.innerText : null);

            } else if (pref.replace('#', '').startsWith('style')) {

              vl[pref.replace('#', '')] = (eref.style[pref.replace('#', '').replace('style.', '')] ? eref.style[pref.replace('#', '').replace('style.', '')] : null);

            } else if (pref.replace('#', '') == 'value') {
              vl[pref.replace('#', '')] = (eref.value);
            } else {
              vl[pref.replace('#', '')] = (eref.attributes[pref.replace('#', '')] ? eref.attributes[pref.replace('#', '')].value : null);
            }
          } else {

            vl[sub[j]] = rl[r];
          }
        }
        vals.push(vl);
      }
      if (f && rl[r] && rl[r].classList) await f((sub != '' ? rl[r][sub] : rl[r]), r);
    }

    if (e) return e(rl);

    if (sub != '') return vals;
    return rl;
  },
  last_item: function (ar) {
    ar = def(ar, []);
    if (!def(ar.length)) return null;
    return ar[ar.length - 1];
  },
  JsIden: 0,
  js: function (op, adr) {
    if (!def(op)) return null;
    // try {
    var lines = op.split("\n");

    var funjs = "";
    for (var i in lines) {
      if (lines[i].indexOf(" //") != -1) {
        funjs += lines[i].split(" //")[0].trim();
      } else funjs += lines[i];
    }

    var r = window.eval(
      " r = " + funjs.replaceAll("\n", " ").replaceAll("\r", " ")
    );
    return r;
    // } catch (e) {
    //  console.log("Error JS:",e.message,"code :" + op,adr);
    // }
  },
  asyncjs: async function (op, adr) {
    if (!def(op)) return null;
    // try {
    var lines = op.split("\n");

    var funjs = "";
    for (var i in lines) {
      if (lines[i].indexOf(" //") != -1) {
        funjs += lines[i].split(" //")[0].trim();
      } else funjs += lines[i];
    }

    var r = window.eval(
      " r = " + funjs.replaceAll("\n", " ").replaceAll("\r", " ")
    );
    return r;
    // } catch (e) {
    //  console.log("Error JS:",e.message,"code :" + op,adr);
    // }
  },
  mixdeep: function (a, b) {
    var j = {};

    for (var i in a) {
      j[i] = a[i];
    }

    for (var i in b) {
      if (typeof (b[i]) == 'object') {



        j[i] = _dy.mixdeep(a[i], b[i]);


      } else {
        j[i] = b[i];
      }
    }
    return j;
  },
  mix_json: function (a, b, n) {
    if (n) for (var bi in b) a[bi] = def(b[bi], def(a[bi], ""));
    else
      for (var bi in b)
        if (a[bi] != null && a[bi] != undefined)
          a[bi] = def(b[bi], def(a[bi], ""));

    return a;
  },
  rgbToHex: function (r, g, b) {
    return "#" + cth(r) + cth(g) + cth(b);
  },

  hexToRgb: function (hex, d) {
    d = def(d, 1.0);
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
        r: parseInt(result[1], 16) / d,
        g: parseInt(result[2], 16) / d,
        b: parseInt(result[3], 16) / d,
        x: parseInt(result[1], 16) / d,
        y: parseInt(result[2], 16) / d,
        z: parseInt(result[3], 16) / d,
        w: 1.,
      }
      : null;
  },

  temp_baseIdentity: 0,
  temp_objectIden: 0,
  temp_object: [],
  temp_img: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAABdJREFUKFNjZCASMBKpjmFUId6QIjp4AAppAAuXjCs4AAAAAElFTkSuQmCC`,

  behindLoopContainer: [],
  behindLoop: function () {

    for (var i in dy.behindLoopContainer)
      if (dy.behindLoopContainer[i])
        dy.behindLoopContainer[i]();

    requestAnimationFrame(dy.behindLoop);
  },
  TsID: [],
  TsName: [],

  rootUps: [],
  rootMoves: [],
  rootClick: [],
  rootWheel: [],
  compileHtmlHashParts: function (d, pms) {
    var hash = d.split('#is value ').join('#end#is define_#equ_').split('#is not define ').join('#end#is define _#not_')
      .replaceAll('#is define ', '#is define _#def_')
      .replaceAll('#is define_#equ_', '#is define _#equ_').split('#is define ');


    if (pms && hash.length > 1) {
      d = '';


      for (var i in hash) {


        if (hash[i].startsWith('_#equ_') // is not
          && hash[i].indexOf(' ') != -1
          && hash[i].indexOf('#end') != -1) {



          var cond = hash[i].split('#then')[0].replace('_#equ_', '');
          var v1true = hash[i].split('#then')[1].split('#end')[0].split('#else')[0].replace('_#equ_', '');

          var v1false = '';


          if (hash[i].indexOf('#else') != -1) {
            v1false = hash[i].split('#then')[1].split('#end')[0].split('#else')[1];
          }

          for (var _mp in pms) {
            cond = cond.replaceAll('$$' + _mp, pms[_mp]);
          }

          try {
            window._localItem = pms;

            cond = cond.replace('$$$item', '_localItem');

            if (_dy.js(cond)) {

              d += v1true +
                hash[i].replace('_#def_', '').replace('_#equ_', '').splitFirst('#end')[1];

            } else {

              d += v1false +
                hash[i].replace('_#def_', '').replace('_#equ_', '').splitFirst('#end')[1];


            }
          } catch (e) {
            console.log(cond, e);

            d += ' error ' +
              hash[i].replace('_#def_', '').replace('_#equ_', '').splitFirst('#end')[1];


          }


        }
        else if (hash[i].startsWith('_#not_') // is not
          && hash[i].indexOf(' ') != -1
          && hash[i].indexOf('#end') != -1
          && pms[hash[i].split(' ')[0].replace('_#def_', '').replace('_#not_', '')] == undefined) {

          d += hash[i].replace('_#def_', '').replace('_#not_', '').split('#end')[0].split('#else')[0].splitFirst(' ')[1] +
            hash[i].replace('_#def_', '').replace('_#not_', '').splitFirst('#end')[1];


        }
        else if (hash[i].startsWith('_#not_') // is not and defined else not
          && hash[i].indexOf(' ') != -1
          && hash[i].indexOf('#end') != -1
          && pms[hash[i].split(' ')[0].replace('_#def_', '').replace('_#not_', '')] != undefined) {

          d += hash[i].split('#else')[1].split('#end')[0] + hash[i].split('#end')[1];


        }
        else if (hash[i].startsWith('_#def_')
          && hash[i].indexOf(' ') != -1 // is def and defined
          && hash[i].indexOf('#end') != -1
          && pms[hash[i].split(' ')[0].replace('_#def_', '')] != null
          && pms[hash[i].split(' ')[0].replace('_#def_', '')] != undefined
          && pms[hash[i].split(' ')[0].replace('_#def_', '')] != false
          && pms[hash[i].split(' ')[0].replace('_#def_', '')].valueOf() * 1 != 0
          && pms[hash[i].split(' ')[0].replace('_#def_', '')] != ''
        ) {


          d += hash[i].split('#end')[0].split('#else')[0].splitFirst(' ')[1] +
            hash[i].splitFirst('#end')[1];

        } else if (hash[i].indexOf(' ') != -1 // is def and not defined else  def
          && hash[i].indexOf('#end') != -1
          && hash[i].indexOf('#else') != -1
          && pms[hash[i].split(' ')[0].replace('_#def_', '')] == undefined) {


          d += hash[i].split('#else')[1].split('#end')[0] + hash[i].splitFirst('#end')[1];

        } else {

          if (hash[i].startsWith('_#def_')) {
            d += hash[i].split('#end')[1];

          } else {
            d += hash[i];
          }

        };
      }
      d = d.replaceAll('#end;', '').replaceAll('#end', '').replaceAll('_#def_', '');
    }

    var dyeval = d.split('#)').join('#dy_#end_').replaceAll('#dy(', '#dy_#start_').split('#dy');

    if (pms && dyeval.length > 1) {
      d = '';


      for (var i in dyeval) {

        if (dyeval[i].startsWith('_#start_')) {

          var cond = dyeval[i].replace('_#start_', '');


          for (var _mp in pms) {
            cond = cond.replaceAll('$$' + _mp, pms[_mp]);
          }

          try {

            d += _dy.js(cond);

          } catch (e) {


            d += ' dy error ';

          }

        } else {
          d += dyeval[i].replace('_#end_', '');
        }

      }
      d = d.replaceAll('#end;', '').replaceAll('#end', '').replaceAll('_#def_', '');
    }

    return d;

  },

  initInnerContent: async function (d, fn, fs, pms, fe) {

    fn = def(fn, function (d) {
      return d;
    });
    fs = def(fs, function (d) {
      return d;
    });

    d = d
      .replaceAll(
        "<loader",
        ` <img src="$$temp_img" onload="_dy.elementPageLoad(this,$$TID)" /><tmp class="hdn-i" `
      ).replaceAll(
        "<iloader",
        `<div ><img src="$$temp_img" onload="_dy.elementPageLoad(this,$$TID)" /><tmp class="hdn-i"`
      ).replaceAll(
        "<repeater",
        `<img src="$$temp_img" onload="_dy.elementPageRepeat(this,$$TID)" /><textarea class="hdn-i" `
      )
      .replaceAll(
        "<switcher",
        `<img src="$$temp_img" onload="_dy.elementPageSwitch(this,$$TID)" /><textarea class="hdn-i" `
      )
      .replaceAll(
        "<callscript>",
        `<img src="$$temp_img" onload="`
      )
      .replaceAll(
        "</callscript>",
        `" />`
      )

      .replaceAll(
        "<dy ",
        `<div ><img src="$$temp_img" onload="_dy.elementPageDynamic(this,$$TID)" /><textarea class="hdn-i" params=`
      ).replaceAll(
        "<dyc ",
        `<img src="$$temp_img" onload="_dy.elementElementDynamic(this,$$TID)" /><tmp class="hdn-i" params=`
      ).replaceAll(
        "<com",
        `<div ><img src="$$temp_img" onload="_dy.elementPageLoad(this,$$TID)" /><tmp class="hdn-i" page=`
      ).replaceAll(
        "<content",
        `<img src="$$temp_img" onload="_dy.elementPageDynamic(this,$$TID)" /><textarea class="hdn-i" `
      ).replaceAll(
        "<icontent",
        `<div ><img src="$$temp_img" onload="_dy.elementPageDynamic(this,$$TID)" /><textarea class="hdn-i" `
      )
      .replaceAll("</loader>", ` </tmp> `)
      .replaceAll("</iloader>", ` </tmp></div>`)
      .replaceAll("</com>", ` </tmp></div>`)
      .replaceAll("</repeater>", `</textarea>`)
      .replaceAll("</dy>", `</textarea></div>`)
      .replaceAll("</dyc>", `</tmp>`)
      .replaceAll("</dy-style>", `</textarea></div>`)
      .replaceAll("</content>", `</textarea>`)
      .replaceAll("</icontent>", `</textarea></div>`)
      .replaceAll("$$root", dy.basePath)
      .replaceAll("$$src=", "src=")
      .replaceAll("$$date", new Date().getTime())
      .replaceAll("$$images", "/images")
      .replaceAll("$$temp_img", _dy.temp_img);


    d = _dy.compileHtmlHashParts(d, pms);

    if (pms && d.indexOf("/// header") != -1) {
      var sd0 = d.split("/// header");


      d = sd0[1];

      var fsLocalList = {};

      fsLocalList.dy_init = js(' async function (item){' + sd0[0].replace("<script>", "").replace("</script>", '') + ' return item;} ;    ');
      var iitem = await fsLocalList.dy_init(fsLocalList);
      for (var i in iitem)
        pms[i] = iitem[i];


    }

    if (pms) {

      for (var pm in pms) {

        if (typeof (pms[pm]) == 'object') {
          _dy.temp_objectIden++;
          _dy.temp_object[_dy.temp_objectIden] = pms[pm];
          d = d.replaceAll('$$' + pm, '_dy.temp_object[' + _dy.temp_objectIden + ']');
        } else {

          d = d.replaceAll('$$' + pm, pms[pm]);
        }
      }
    }




    var sd0 = [];
    _dy.TsID[pms.TID] = def(_dy.TsID[pms.TID], {});

    _dy.TsID[pms.TID].ref = pms;
    _dy.TsID[pms.TID].ref.parent = def(pms.parent, pms.TID);


    if (d.indexOf("/// main content") != -1) {
      sd0 = d.split("/// main content");


      d = sd0[1];


      _dy.TsID[pms.TID].initScript = fs(sd0[0]).replace("<script>", "").replace("</script>", "_dy.JsIden++;");


      dy.prototype.callInitialized(pms.TID, function (d) {

      });
    }


    d = d.replaceAll('$$out', '').replaceAll('$$hover', '').replaceAll('_ext$$ext', '');

    var sd = [];
    if (d.indexOf("/// background script") != -1) {
      sd = d.split("/// background script");
      d = sd[0];
    }
    _dy.TsID[pms.TID]._script = sd[1];
    fn(d);

    if (fs && sd.length != 0) {
      window.eval(fs(sd[1]).replace("<script>", "").replace("</script>", "_dy.JsIden++;")
        .replaceAll('$$_', '_dy.TsID[' + pms.TID + '].'))
        ;
      fe(_dy.TsID[pms.TID]);
    } else fe(_dy.TsID[pms.TID]);
  },
  init_page: function (d, json) {


    for (var it in json) {
      d = d.replaceAll('$$' + it, json[it]);
    }

    d = d.replaceAll('$$hide', 'hdn-i ');

    return d;
  },


  callInitialized: async function (tid, f) {
    var callScript = null;

    if (_dy.TsID[tid] && _dy.TsID[tid].initScript) {

      callScript = dy.prototype.js('callScript = async function(f,data){ ' + _dy.TsID[tid].initScript.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']') + ' _dy.TsID[' + tid + '].scriptApplyed = true; f(_dy.TsID[' + tid + '].data);  }');
    }

    if (callScript) await callScript(f, _dy.TsID[tid]);
    else f();
  },


  helpers: [],

  img: function (path, f) {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      originalImageData = ctx.canvas.toDataURL();
      f(originalImageData, img.height / img.width);
    };
    img.src = path;
  },

  /**
   * 
   * for download content 
   * @param {url,type,success,begin,faild,end,progress} op 
   * type= GET,POST,PUT,DEL,PATCH
   */
  down: function (op) {
    op = def(op, {});
    op.type = def(op.type, "Get");
    op.url = def(op.url, "/");
    op.success = def(op.success, function (data) { });
    op.error = def(op.error, function (data) { });
    op.end = def(op.end, function () { });
    op.begin = def(op.begin, function () { });
    op.option = def(op.option, {});



    function processData(data) {
      op.success(data, op.option);
    }

    function handler() {
      op.subProgress = def(op.subProgress, function (p) { });
      op.subProgress(this);
      if (this.readyState == this.DONE) {
        if (this.status == 200) {
          // success!

          processData(this.responseText);
        } else {
          op.error(this);
        }
        op.end();
      }
    }

    try {



      var client = new XMLHttpRequest();

      client.onreadystatechange = handler;
      client.open(op.type, op.url);
      client.setRequestHeader('Access-Control-Allow-Origin', '*');
      op.begin(client);
      client.send();
      client.onprogress = function (pe) {
        if (pe.lengthComputable) {
          op.progress = def(op.progress, function (p) { });
          op.progress(pe.loaded * 100 / pe.total);
        }
      };
    } catch (e) {
      op.error(e);
      op.end();
    }
  }
  /**
 * 
 * for upload content
 * @param {url,type,success,begin,faild,end,progress} op 
 * type= GET,POST,PUT,DEL,PATCH
 */
  , upload: function (op) {
    op = def(op, {});
    op.type = def(op.type, "POST");
    op.url = def(op.url, "/");
    op.success = def(op.success, function (data) { });
    op.error = def(op.error, function (data) { });
    op.end = def(op.end, function () { });
    op.begin = def(op.begin, function () { });

    function processData(data) {
      op.success(data);
    }

    function handler() {
      if (this.readyState == this.DONE) {
        if (this.status == 200) {
          // success!
          processData(this.responseText);
        } else {
          op.error(this);
        }
        op.end();
      }
    }

    try {
      var client = new XMLHttpRequest();
      op.begin(client);
      client.onreadystatechange = handler;
      if ("withCredentials" in client) {
        client.open(op.type, op.url, true);
        client.upload.onprogress = function (pe) {
          if (pe.lengthComputable) {
            op.progress = def(op.progress, function (p) { });
            op.progress(pe.loaded * 100 / pe.total);
          }
        };
      } else if (typeof XDomainRequest != "undefined") {
        // Otherwise, check if XDomainRequest.
        // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
        client = new XDomainRequest();
        client.onreadystatechange = handler;

        client.open(op.type, op.url);
        client.upload.onprogress = function (pe) {
          if (pe.lengthComputable) {
            op.progress = def(op.progress, function (p) { });
            op.progress(pe.loaded * 100 / pe.total);
          }
        };
      }

      if (def(op.file)) {
        var data = new FormData();
        _for(
          op.file,
          function (at, i) {
            data.append("file" + i, at.data);
          },
          function () {
            client.setRequestHeader("content", JSON.stringify(op.data));
            client.send(data);
            client.upload.onprogress = function (pe) {
              if (pe.lengthComputable) {
                op.progress = def(op.progress, function (p) { });
                op.progress(pe.loaded * 100 / pe.total);
              }
            };
          }
        );
      } else {
        client.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        client.send(def(op.data, false) ? JSON.stringify(op.data) : "");
        client.onprogress = function (pe) {
          if (pe.lengthComputable) {
            op.progress = def(op.progress, function (p) { });
            op.progress(pe.loaded * 100 / pe.total);
          }
        };
      }
    } catch (e) {
      op.error(e);
      op.end();
    }
  },

  getDyElement: function (sel) {
    if (!first(sel) || first(sel).iden) return null;
    return _dy.TsID[first(sel).iden];
  }
  ,
  coreScript: [],
  coreThreadIdentity: 0,
  reload: function (par, itm, page, path, fun, template) {

    par.innerHTML = '';

    this.append(par, itm, page, path, fun, template);


  }
  , append: function (par, itm, page, path, fun, template) {
    var div = document.createElement('div');

    var data = itm;
    data.type = itm.type;
    data.name = itm.name;
    data.title = itm.title;

    div.className = 'w-full';

    data.page = page;
    data.path = path;
    data.item = def(itm.item, 1);

    div.data = data;

    par.appendChild(div);

    dyHtml.loader(div, data, template, fun);
  }
  , loader: function (tid, data, template, fun) {




    if (typeof (tid) != "number") {

      if (!tid || !tid.iden) {

        _dy.TsID[++dy.prototype.temp_baseIdentity] = { ctrl: tid };

        tid = _dy.temp_baseIdentity;
      } else tid = (tid.iden);
    }

    if (!_dy.TsID[tid]) {

      console.log('Error Replace:', tid + ' not found component!');
      return;
    }

    var ctl = _dy.TsID[tid].ctrl;

    var th = { parentNode: ctl };
    th.nextElementSibling = {
      value: template ? template : _dy.TsID[tid].template,
      attributes: {
        "params": { value: data },
      },

      setAttribute: function (n, v) {
        th.nextElementSibling.attributes[n] = { value: v };

      },

    };

    if (typeof (data) == "object") {


      if (data.length) {
        dy.prototype.elementPageRepeat(th, tid, true, fun);
      } else {

        th.nextElementSibling.attributes = {
          "params": { value: data },
          "path": { value: data.path },
          "page": { value: data.page },
        };
        th.nextElementSibling.setAttribute = function (n, v) {
          th.nextElementSibling.attributes[n] = { value: v };
        };



        dy.prototype.elementPageLoad(th, tid, true, fun);
      }

    } else if (typeof (data) == "number") {

      th.nextElementSibling.attributes['oncreate'] = { value: 'item = ' + data + ';' };
      elementPageSwitch(th, tid, true, fun);

    } else if (typeof (data) == "string") {

    }

  },
  renderElement: async function (element, page, params, css) {
    if (element)
      element.innerHTML = '';
    else return;
    var dv = document.createElement('div');
    dv.className = css;
    var val = await _dy.render(page, params, true);

    _dy.TsID[val.data.TID].ctrl = dv;
    _dy.TsID[val.data.TID].ref = params;

    try {

      var st1 = _dy.TsID[val.data.TID]._script.replace("<script>", "").replace("</script>", "_dy.JsIden++;")
        .replaceAll('$$_', '_dy.TsID[' + val.data.TID + '].');

      window.eval(st1);

    } catch (e) {
      /* console.log('render script error :'+val.data.TID+' ' , _dy.TsID[val.data.TID] , e); */
      if (!_dy._logs) _dy._logs = [];
      _dy._logs.push('render script error :' + val.data.TID);
    }

    dv.innerHTML = val.html;

    element.appendChild(dv);
    return;
  }
  , render: async function (page, data, showData) {
    let myPromise = new Promise(function (resolve, reject) {

      _dy.loadPage(page, null, function (c, d, p) {

        resolve(showData ? { html: d, data: p } : d);

      }, undefined, data);

    });
    return await myPromise;
  },

  elementPageLoad: function (th, tid, noNeedParse, fun) {

    var nxt = th.nextElementSibling;

    var par = th.parentNode;
    par.iden = tid;
    if (_dy.TsID[tid] && _dy.TsID[tid].name)
      par.name = _dy.TsID[tid].name;

    if (!nxt.attributes['def']) nxt.setAttribute('def', 'true');
    var def = dy.prototype.js(nxt.attributes['def'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
    if (!def) {
      par.remove();
      return;
    }


    if (!nxt.attributes['page']) nxt.setAttribute('page', 'icon');
    if (!nxt.attributes['path']) nxt.setAttribute('path', '/');
    if (!nxt.attributes['params']) nxt.setAttribute('params', '{}');

    if (nxt.attributes['path'].value.indexOf('$$_') != -1 && nxt.attributes['path'].value.indexOf('.') != -1) {
      var sp1 = nxt.attributes['path'].value.split('.');

      if (typeof (_dy.TsID[tid][sp1[0].replaceAll('$$_', '')]) == 'string' && _dy.TsID[tid][sp1[0].replaceAll('$$_', '')].toString().indexOf('temp_') != -1) {
        nxt.attributes['path'].value = dy.prototype.js(_dy.TsID[tid][sp1[0].replaceAll('$$_', '')])[sp1[1]];
      }

    }


    if (nxt.attributes['path'].value.indexOf('$$_') != -1)
      nxt.attributes['path'].value = dy.prototype.js(nxt.attributes['path'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));

    if (nxt.attributes['page'].value.indexOf('$$_') != -1 && nxt.attributes['page'].value.indexOf('.') != -1) {
      var sp1 = nxt.attributes['page'].value.split('.');

      if (typeof (_dy.TsID[tid][sp1[0].replaceAll('$$_', '')]) == 'string' && _dy.TsID[tid][sp1[0].replaceAll('$$_', '')].toString().indexOf('temp_') != -1) {
        nxt.attributes['page'].value = dy.prototype.js(_dy.TsID[tid][sp1[0].replaceAll('$$_', '')])[sp1[1]];
      }
    }

    if (nxt.attributes['page'].value.indexOf('$$_') != -1)
      nxt.attributes['page'].value = dy.prototype.js(nxt.attributes['page'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));



    if (nxt.attributes['online']) nxt.online = dy.prototype.js('function(p){var element = p;var me = p.event;' + nxt.attributes['online'].value + '}');
    if (nxt.attributes['onready']) nxt.onready = dy.prototype.js('function(element,model){ ' + nxt.attributes['onready'].value + '}');

    par.onready = nxt.onready;

    var param;

    if (typeof (nxt.attributes['params'].value) == 'string' &&
      nxt.attributes['params'].value.indexOf('$$_') != -1 &&
      nxt.attributes['params'].value.indexOf('.') != -1 &&
      (nxt.attributes['params'].value[0] != '{' && nxt.attributes['params'].value[0] != '[')
    ) {
      var sp1 = nxt.attributes['params'].value.split('.');

      if (typeof (_dy.TsID[tid][sp1[0].replaceAll('$$_', '')]) == 'string' && _dy.TsID[tid][sp1[0].replaceAll('$$_', '')].toString().indexOf('temp_') != -1) {
        param = dy.prototype.js(_dy.TsID[tid][sp1[0].replaceAll('$$_', '')])[sp1[1]];
      }
    }
    else if (!noNeedParse)
      param = dy.prototype.js(nxt.attributes['params'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
    else
      param = nxt.attributes['params'].value;
    var cls = nxt.attributes && nxt.attributes['css'] ? nxt.attributes['css'].value : '';
    if (cls != '')
      par.className = cls;

    if (nxt.innerHTML && param) {
      param.content = nxt.innerHTML;
    }

    dy.prototype.loadPage(nxt.attributes['page'].value, par, fun, nxt.attributes['path'].value, param, nxt.online);

  },
  initDrop: function (type, dropEvent, op) {

    if (!_dy['dragList' + type]) {
      _dy['dragList' + type] = [];
      _dy['dragList' + type + '_state'] = 0;
      _dy['dragList' + type + '_iden'] = 0;
      _dy['dragList' + type + '_Height'] = 10;
      _dy['dragList' + type + '_Width'] = 10;
    }


    _dy.elements('.dropItem._' + type, function (dropItem) {


      if (dropItem && dropItem.addEventListener && _dy.element('.item_' + type, dropItem)) {

        _dy.element('.item_' + type, dropItem).addEventListener("dragstart", (event) => {


          // make it half transparent 
          event.stopPropagation();
          event.currentTarget.classList.add('draged');

          if (op)
            op.start(event.currentTarget, type);
          else {
            _dy.hideAllDragHelper();

            _dy['dragList' + type + '_state'] = 1;

            _dy['dragList' + type][++_dy['dragList' + type + '_iden']] = dropItem;
            _dy['dragList' + type + '_Height'] = max(10, dropItem.offsetHeight);
            _dy['dragList' + type + '_Width'] = max(10, dropItem.offsetWidth);
          }

          event.dataTransfer.setData("text", _dy['dragList' + type + '_iden']);


        });

        dropItem.addEventListener("dragover", (event) => {




          // reset the transparency 
          var th = event.currentTarget;

          if (op && op.over) { op.over(th, type, _dy.lastItemOvered); return; }

          if (_dy.lastItemOvered && _dy.lastItemOvered != th) {
            _dy.elements('.before,.after,.middle', function (sub) {

              if (sub && sub.classList) {
                sub.classList.add('hdn-i');

              }
            }, null, null, _dy.lastItemOvered);
          }


          event.stopPropagation();



          var mps = event.offsetY;


          _dy.lastItemOvered = th;

          _dy.elements('dropItem .before,.after,.middle', function (sub) {

            if (sub && sub.classList)
              sub.classList.add('hdn-i');

          }, function () {


            if (_dy.element('.before' + th.id, th)) _dy.element('.before' + th.id, th).classList.remove('hdn-i');
            if (_dy.element('.after' + th.id, th)) _dy.element('.after' + th.id, th).classList.remove('hdn-i');
            if (_dy.element('.middle' + th.id, th)) _dy.element('.middle' + th.id, th).classList.remove('hdn-i');



          }, null, th.parentNode);
        });

        var drop = (event, next) => {

          var curr = event.currentTarget;
          var th = event.currentTarget.parentNode;

          if (op && op.drop) {

            op.drop(th, type, _dy.lastItemOvered); dropEvent(); return;
          }



          _dy.hideAllDragHelper();

          _dy.elements(' .draged', function (sub) {
            if (sub && sub.classList)
              sub.classList.remove('draged');
          });

          event.preventDefault();

          var dv = null;

          var data = event.dataTransfer.getData("text");

          if (_dy['dragList' + type + '_state'] == 1) {

            _dy['dragList' + type + '_state'] = 0;
            dv = _dy['dragList' + type][data];
          } else {
            /// unknown drop


          }

          if (th.parentNode)
            if (next == 1) {
              if (th.nextElementSibling) {
                th.parentNode.insertBefore(dv, th.nextElementSibling);
                dropEvent();
              }
              else {
                th.parentNode.appendChild(dv);
                dropEvent();
              }
            }
            else if (next == 0) {
              th.parentNode.insertBefore(dv, th);
              dropEvent();
            }
            else if (curr.nextElementSibling
              && curr.nextElementSibling.appendChild) {

              curr.nextElementSibling.appendChild(dv);

              dropEvent();
            }


        };

        if (_dy.element('.before' + dropItem.id, dropItem))
          _dy.element('.before' + dropItem.id, dropItem).addEventListener("drop", (event) => { drop(event, 0); });
        if (_dy.element('.after' + dropItem.id, dropItem))
          _dy.element('.after' + dropItem.id, dropItem).addEventListener("drop", (event) => { drop(event, 1); });
        if (_dy.element('.middle' + dropItem.id, dropItem))
          _dy.element('.middle' + dropItem.id, dropItem).addEventListener("drop", (event) => { drop(event, 2); });


      }
    });
  },
  hideAllDragHelper: function () {

    _dy.elements('.dropItem .before,.after,.middle', function (sub) {
      if (sub && sub.classList)
        sub.classList.add('hdn-i');
    });

  },
  repRef: [],
  elementPageRepeat: function (th, tid, noNeedParse, fun) {

    var txt = th.nextElementSibling;

    var par = th.parentNode;
    par.iden = tid;


    if (_dy.TsID[tid] && _dy.TsID[tid].name)
      par.name = _dy.TsID[tid].name;

    if (!txt.attributes['params']) txt.setAttribute('params', '{}');

    if (txt.attributes['online']) txt.online = dy.prototype.js('function(p){var element = p;var me = p.event;' + txt.attributes['online'].value + '}');

    var param;
    if (!noNeedParse)
      param = dy.prototype.js(txt.attributes['params'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
    else
      param = txt.attributes['params'].value;

    if (!txt.attributes['def']) txt.setAttribute('def', 'true');
    var def = dy.prototype.js(txt.attributes['def'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
    if (!def) {
      par.remove();
      return;
    }

    let txtValue = txt.value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']');

    if (txt.attributes['oncreate']) txt.oncreate = dy.prototype.js('function(cont ,data,index){ var content = cont; ' + txt.attributes['oncreate'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']') + ' return content;}');

    if (!txt.oncreate) txt.oncreate = null;

    if (!_dy.TsID[tid]) _dy.TsID[tid] = {};

    _dy.TsID[tid].template = txt.value;
    _dy.TsID[tid].ctrl = par;

    var content = '';

    var r_ind = 0; 
    if (param)
      for (var i in param) {
        var ip = param[i];
        if (typeof (ip) == 'object') {
          ip.repeaterKey = i;
          ip.repeaterIndex = r_ind++;
          _dy.repRef.push(ip);
          var ind_rep = _dy.repRef.length - 1;

          var c = txtValue;

          for (var j in ip) {


            c = c.replaceAll('$$' + j + '.', '$$key_' + j + '_');

          }

          for (var j in ip) {


            c = c.replaceAll('$$' + j, (ip[j]));
            c = c.replaceAll('$$repeaterItem', '_dy.repRef[' + ind_rep + ']');
            c = c.replaceAll('$$repeaterKey', i);

            for (var vk in ip[j]) {
              c = c.replaceAll('$$key_' + j + '_' + vk, ip[j][vk]);
            }

          }

          if (txt.oncreate) {
            c = txt.oncreate(c, ip, i);
          }

          c = c.replaceAll('$$hide', 'hdn-i ')
            .replaceAll('#_is', '#is')
            .replaceAll('#_else', '#else')
            .replaceAll('#_then', '#then')
            .replaceAll('#_end', '#end')
            .replaceAll('#_dy', '#dy')
            .replaceAll('#_)', '#)')
            ;

          c = _dy.compileHtmlHashParts(c, ip);


          content += c;
        }
      }

    if (par.onready) par.onready(content);

    par.innerHTML = content;
    var cls = txt.attributes && txt.attributes['css'] ? txt.attributes['css'].value : '';
    if (cls != '')
      par.className = cls;

    if (fun) fun(par);

    if (txt && txt.remove)
      txt.remove();


  },
  elementPageSwitch: function (th, tid, noNeedParse, fun) {

    var txt = th.nextElementSibling;


    if (_dy.TsID[tid] && _dy.TsID[tid].initScript)
      dy.prototype.js(_dy.TsID[tid].initScript.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'), 'init script ' + tid + th.innerHTML);

    var par = th.parentNode;
    par.iden = tid;

    if (_dy.TsID[tid] && _dy.TsID[tid].name)
      par.name = _dy.TsID[tid].name;


    if (!txt.attributes['params']) th.setAttribute('params', '{}');

    if (txt.attributes['online']) th.online = dy.prototype.js('function(p){var element = p;var me = p.event;' + th.attributes['online'].value + '}');


    var param;

    if (!noNeedParse)
      param = dy.prototype.js(txt.attributes['params'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
    else
      param = txt.attributes['params'].value;

    if (!txt.attributes['def']) txt.setAttribute('def', 'true');
    var def = dy.prototype.js(txt.attributes['def'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
    if (!def) {
      par.remove();
      return;
    }

    let txtValue = txt.value.split('$$next-case');

    if (txt.attributes['oncreate']) txt.oncreate = dy.prototype.js('function(content,data){var item = 0;' + txt.attributes['oncreate'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']') + ' return item;}');

    if (!txt.oncreate) txt.oncreate = null;

    var content = '';

    if (!_dy.TsID[tid]) _dy.TsID[tid] = {};

    _dy.TsID[tid].template = txt.value;
    _dy.TsID[tid].ctrl = par;

    var ip = param;

    if (txt.oncreate)
      var item = txt.oncreate(c, ip);

    var c = txtValue[item].replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']');

    for (var j in ip) {
      c = c.replaceAll('$$' + j, (ip[j]));
    }

    c = c.replaceAll('$$hide', 'hdn-i ');

    content = c;

    if (par.onready) par.onready(content);

    par.innerHTML = content;

    if (fun) fun(par);

    if (!noNeedParse)
      txt.remove();

  },

  elementElementDynamic: function (th, tid, fun) {

    var txt = th.nextElementSibling;



    if (_dy.TsID[tid] && _dy.TsID[tid].initScript)
      dy.prototype.js(_dy.TsID[tid].initScript.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));

    var par = th.parentNode;
    if (!txt.attributes['params']) th.setAttribute('params', '{}');

    if (txt.attributes['online']) th.online = dy.prototype.js('function(p){var element = p;var me = p.event;' + th.attributes['online'].value + '}');


    var param = dy.prototype.js(txt.attributes['params'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));



    if (!txt.attributes['def']) txt.setAttribute('def', 'true');
    var def = dy.prototype.js(txt.attributes['def'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
    if (!def) {
      par.remove();
      return;
    }


    let txtValue = txt.innerHTML;

    if (txt.attributes['oncreate']) txt.oncreate = dy.prototype.js('function(content,data){var item = 0;' + txt.attributes['oncreate'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']') + ' return content;}');

    if (!txt.oncreate) txt.oncreate = null;

    var content = '';

    var ip = param;

    if (txt.oncreate)
      c = txt.oncreate(c, ip);

    var c = txtValue;

    for (var j in ip) {
      c = c.replaceAll('$$' + j, (ip[j]));
    }

    c = c.replaceAll('$$hide', 'hdn-i ');

    content = c;

    if (par.onready) par.onready(content);


    par.innerHTML = content;

    if (fun) fun(par);

    txt.remove();

  },
  elementPageDynamic: function (th, tid, fun) {

    var txt = th.nextElementSibling;


    if (_dy.TsID[tid] && _dy.TsID[tid].initScript)
      dy.prototype.js(_dy.TsID[tid].initScript.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));

    var par = th.parentNode;
    if (!txt.attributes['params']) th.setAttribute('params', '{}');

    if (txt.attributes['online']) th.online = dy.prototype.js('function(p){var element = p;var me = p.event;' + th.attributes['online'].value + '}');


    var param = dy.prototype.js(txt.attributes['params'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));



    if (!txt.attributes['def']) txt.setAttribute('def', 'true');
    var def = dy.prototype.js(txt.attributes['def'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']'));
    if (!def) {
      par.remove();
      return;
    }


    let txtValue = txt.value;

    if (txt.attributes['oncreate']) txt.oncreate = dy.prototype.js('function(content,data){var item = 0;' + txt.attributes['oncreate'].value.replaceAll('$$_', '_dy.TsID[' + tid + '].').replaceAll('$$$item', '_dy.TsID[' + tid + ']') + ' return content;}');

    if (!txt.oncreate) txt.oncreate = null;

    var content = '';

    var ip = param;

    if (txt.oncreate)
      c = txt.oncreate(c, ip);

    var c = txtValue;

    for (var j in ip) {
      c = c.replaceAll('$$' + j, (ip[j]));
    }

    c = c.replaceAll('$$hide', 'hdn-i ');

    content = c;

    if (par.onready) par.onready(content);


    par.innerHTML = content;



    var cls = txt.attributes && txt.attributes['css'] ? txt.attributes['css'].value : '';
    par.className = cls;

    if (fun) fun(par);

    txt.remove();

  },
  dyHtmlExtensionFormat: ".htm",
  cacheComopunents: [],
  renderTemplate: async function (template, data, showData) {

    let myPromise = new Promise(function (resolve, reject) {

      var init = function (d) {

        var ctl = document.createElement('div');

        //ctl.style.display = 'none';


        _dy.temp_baseIdentity++;
        var pms = { data: data };
        pms.TID = _dy.temp_baseIdentity;
        ctl.id = 'temp_' + pms.TID;

        _dy.TsID[pms.TID] = pms;

        dy.prototype.initInnerContent(d, function (d1) {


          if (!_dy.TsID[pms.TID]) _dy.TsID[pms.TID] = { ref: pms };

          if (_dy.TsID[pms.TID] != undefined) {

            d1 = dy.prototype.init_page(d1, pms.data);
            _dy.TsID[pms.TID].ctrl = ctl;

            ctl.innerHTML = d1;

             resolve(ctl.innerHTML);
          }


        }, null, pms, function () { 
          if (pms && ctl)
            pms.ready = ctl.onready; 
        });
      };

      init(template);

    });
    return await myPromise;
  },
  loadPage: function (page, ctl, fun, root, pms, fs) {

    var th = this;

    if (_dy.root) root = _dy.root;

    var url = ((def(root, '/') != '/' ? root : '/dyhtml/components/') + page.replaceAll('.', '/') + dy.prototype.dyHtmlExtensionFormat).replace('/public/', '/') + (pms && pms.noCache == 'true' ? '?' + new Date() : '');

    var init = function (d) {


      if (pms && !pms.noCache && !th.cacheComopunents[url]) {
        th.cacheComopunents[url] = d;
      }

      _dy.temp_baseIdentity++;
      pms = def(pms, {});
      pms.TID = _dy.temp_baseIdentity;


      dy.prototype.initInnerContent(d, function (d1) {




        if (!_dy.TsID[pms.TID]) _dy.TsID[pms.TID] = { ref: pms };

        if (_dy.TsID[pms.TID] != undefined) {

          d1 = dy.prototype.init_page(d1, pms.data);
          _dy.TsID[pms.TID].ctrl = ctl;

        }

        if (fun && typeof (fun) == 'function') fun(ctl, d1, pms);
        else { ctl.innerHTML = d1; }


      }, null, pms, function () {



        if (pms && ctl)
          pms.ready = ctl.onready;
        if (fs) fs(pms);
      });
    };

    if (pms && !pms.noCache && th.cacheComopunents && th.cacheComopunents[url]) {
      init(th.cacheComopunents[url]);
      return;
    }


    dy.prototype.down({
      url: url, success: init
    });
  },

  urlParam: function (index) {
    return location.href.replaceAll('%20', ' ').replaceAll('%2B', '+').split('/')[2 + index].split('#')[0];
  },
  routeParam: function (index) {
    if (index == undefined || index == null) {
      return location.search.indexOf('~') ? location.search.split('~') : location.search.split('/');
    }
    if (typeof (index) == 'number') {
      var s = location.search.replace('?', '').indexOf('~') != -1 ? location.search.replace('?', '').split('~')[index] : location.search.replace('?', '').split('/')[index];

      return s;
    }
    else {
      var prs = location.search.split('/');
      for (var i in prs) {
        if (prs[i].toLowerCase().indexOf(index.toString().toLowerCase()) == 0) {
          return prs[i].substring(index.length).replace('?', '');
        }
      }
    }

  },








};
export function dyScript() { }
dyScript.prototype = {
  coreThreadIdentity: 0,
  coreScript: [],
  add: function (p, fn, prm, localJs, ts) {

    dy.prototype.down({
      url: p,
      success: function (d) {

        _dyScript.coreThreadIdentity++;

        var d1 = d;

        if (!prm) prm = {};
        prm.TID = _dyScript.coreThreadIdentity;

        for (var pm in prm) {

          if (typeof (prm[pm]) == 'object') {
            _dy.temp_objectIden++;
            _dyScript.coreScript[_dy.temp_objectIden] = prm[pm];
            d1 = d1.replaceAll('$$' + pm, '_dyScript.coreScript[' + _dy.temp_objectIden + ']');

          } else
            d1 = d1.replaceAll('$$' + pm, prm[pm]);
        }

        if (localJs) {
          var local = {};
          local = dy.prototype.js(d1);

          if (fn) { var l = fn(prm, local); }

        } else {

          window.eval(d1);

          if (ts && fn) setTimeout(fn, ts);
          if (fn) fn(prm);

        }
      }
    });
  }
  , load: function (ps, fn, n, isLocal) {


    if (n == undefined) {
      _dyScript.load(ps, fn, 0, isLocal);
      return;
    }

    if (n < ps.length) {
      _dyScript.add(ps[n], n == ps.length - 1 ? fn : function (op, l) {
        _dyScript.load(ps, fn, n + 1, isLocal);
      }, null, isLocal);
    }
  },



};

String.prototype.splitFirst = function (n, c) {
  var ar = this.split(n);
  ar = ar.reverse();
  var ft = [];
  for (var i = 0; i < def(c, 1); i++)
    ft.push(ar.pop());
  ft = ft.join(n);
  return [ft, ar.reverse().join(n)];
};


var _dyHtml = dy.prototype;
var _dyScript = dyScript.prototype;

if (!window._dyInit) {
  window._dyInit = true;
  _dyHtml.init(_dyHtml, _dyScript);
}

export default {
  html: _dyHtml,
  script: _dyScript
};
