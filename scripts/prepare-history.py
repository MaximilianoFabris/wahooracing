from pathlib import Path
from PIL import Image, ImageOps
import hashlib,json
root=Path.cwd()
src=Path(r'C:\Users\maxfa\Desktop\Wahoo\Photos\Photos')
out=root/'public/assets/history';out.mkdir(parents=True,exist_ok=True)
records=[]
for name,num in [('water','40'),('carve','39'),('team','23'),('exhaust','24'),('pistons','09'),('concepts','12'),('launch','22'),('wake','18'),('engine','03'),('racing','32')]:
 p=src/(num+'.jpg')
 im=ImageOps.exif_transpose(Image.open(p)).convert('RGB')
 for width in (800,1920):
  copy=im.copy();copy.thumbnail((width,width*2));copy.save(out/f'{name}-{width}.webp','WEBP',quality=84,method=6)
 records.append({'asset':name,'source':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'original_dimensions':im.size})
(root/'content/history-photo-provenance.json').write_text(json.dumps(records,indent=2),encoding='utf8')

