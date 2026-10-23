from pathlib import Path
import re, sys
root=Path(__file__).resolve().parents[2]
out=Path(sys.argv[1]);out.mkdir(parents=True,exist_ok=True)
html=(root/'dist/index.html').read_text()
css=(root/'dist/style.css').read_text()
css=re.sub(r'@import[^;]+;','',css)
css=css.replace("'DM Sans','Noto Sans KR',sans-serif", "-apple-system,'Helvetica Neue','Apple SD Gothic Neo',sans-serif").replace("'DM Sans',sans-serif", "-apple-system,sans-serif")
parts=[]
for file in ['physics.mjs','environments.mjs','scene.mjs','storage.mjs','app.js']:
    js=(root/'dist'/file).read_text()
    js=re.sub(r'^import .*?;\n','',js,flags=re.M)
    js=re.sub(r'^export ', '', js, flags=re.M)
    parts.append(js)
js="'use strict';\n"+'\n'.join(parts)
html=html.replace('<link rel="stylesheet" href="style.css">', '<style>'+css+'</style>')
html=html.replace('<script type="module" src="app.js"></script>', '<script>'+js.replace('</script','<\\/script')+'</script>')
html=html.replace('href="./"','href="#"')
html=html.replace('<meta charset="UTF-8">','<meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'unsafe-inline\'; style-src \'unsafe-inline\'; img-src data:; font-src data:; connect-src \'none\'">')
assert '@import' not in html and 'src="app.js"' not in html and 'https://' not in html
(out/'playground.html').write_text(html)
print('Bundled offline playground:',len(html.encode()),'bytes')
