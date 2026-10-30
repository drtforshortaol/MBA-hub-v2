from pathlib import Path
import html
p=[]
def add(s):p.append(s)
def txt(x,y,s,size=24,color='#163e4c',weight=400):add(f'<text x="{x}" y="{y}" font-family="DejaVu Sans,sans-serif" font-size="{size}" fill="{color}" font-weight="{weight}">{html.escape(s)}</text>')
def dot(x,y,n):
 add(f'<circle cx="{x}" cy="{y}" r="16" fill="#fff" stroke="#087f8c" stroke-width="2"/>');add(f'<text x="{x}" y="{y+5}" text-anchor="middle" font-family="DejaVu Sans,sans-serif" font-size="15" fill="#075c67" font-weight="700">{n}</text>')
def labels(y,rows):
 for i,(title,sub) in enumerate(rows,1):
  yy=y+(i-1)*58;dot(620,yy-8,i);txt(650,yy,title,23,weight=700)
  if sub:txt(650,yy+23,sub,17,color='#506872')
add('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1510" viewBox="0 0 1200 1510" role="img" aria-labelledby="title desc"><title id="title">Two fish, different designs: seahorse and trout</title><desc id="desc">Original schematic comparison of external anatomy. Seahorse: tubular snout and small mouth, gill opening, pectoral fin, bony plates, dorsal fin, anal fin, male brood pouch and grasping tail. Trout: gill cover, pectoral fin, scales, dorsal fin, pelvic fin, anal fin, adipose fin and caudal fin. Simplified lateral views, not to scale.</desc>')
add('<rect width="1200" height="1510" fill="#f4f8f7"/><rect width="1200" height="195" fill="#083d4b"/>')
txt(55,62,'LOOK CLOSER',20,'#79d0d1',700);txt(55,115,'Two fish. Different designs.',44,'#fff',700);txt(55,157,'A seahorse and a trout share a fish body plan with striking adaptations.',22,'#e1efef')
for y in [225,825]:add(f'<rect x="35" y="{y}" width="1130" height="570" rx="22" fill="#fff" stroke="#d1e3e1" stroke-width="2"/>')
txt(65,275,'SEAHORSE',28,weight=700);txt(65,306,'Upright body • grasping tail',20,color='#506872')
# Original path geometry, schematic male seahorse facing right.
add('<g stroke="#846335" stroke-width="4" stroke-linejoin="round"><path d="M278 351 L290 329 L307 342 L326 333 L330 355 C359 356 370 370 387 389 L458 411 L455 435 L382 417 C361 421 351 433 353 456 C357 479 382 493 393 525 C417 580 393 627 365 654 C342 677 329 708 346 735 C365 759 400 748 404 728 C406 711 385 704 374 717 C388 710 398 726 385 734 C359 749 343 722 354 705 C368 684 391 675 403 655 C427 614 434 573 420 532 C407 492 385 471 381 451 C376 434 389 432 390 423 L382 394 C369 368 341 361 315 363 L299 350 Z" fill="#d4b576"/><path d="M393 521 Q452 540 444 589 Q424 597 410 612" fill="#efd5a3"/><path d="M356 446 Q322 452 339 472 Q356 470 367 460" fill="#d5e9df"/><path d="M414 520 l22 -7 l-14 22" fill="#d5e9df"/></g>')
# dorsal fin is on posterior (left) trunk; body plates expressed as decorative bands
add('<path d="M387 520 Q343 518 342 558 Q350 580 391 584" fill="#d5e9df" stroke="#846335" stroke-width="3"/>')
for y in [480,500,520,540,560,580,600]:add(f'<path d="M370 {y} q22 8 45 0" fill="none" stroke="#a1834a" stroke-width="2"/>')
add('<circle cx="351" cy="390" r="11" fill="#123f49"/><circle cx="354" cy="386" r="3" fill="#fff"/><path d="M360 435 l-7 9" stroke="#846335" stroke-width="4"/>')
for x,y,n in [(445,410,1),(347,431,2),(324,466,3),(414,501,4),(335,550,5),(449,521,6),(442,578,7),(338,716,8)]:dot(x,y,n)
labels(351,[('Tubular snout & small mouth','A small mouth at the tip'),('Gill opening','Behind the head'),('Pectoral fin','A paired fin; one side shown'),('Bony plates','Armor beneath the skin'),('Dorsal fin','On the back, near the tail base'),('Anal fin','Small fin near the tail base'),('Brood pouch — male','Broods developing young'),('Prehensile tail','Grasps vegetation and other supports')])
txt(65,875,'TROUT',28,weight=700);txt(65,906,'Streamlined body • tail fin',20,color='#506872')
add('<g fill="#a2c2bc" stroke="#315e61" stroke-width="4" stroke-linejoin="round"><path d="M142 1085 Q203 998 402 1066 L451 1084 L521 1036 L506 1096 L521 1159 L452 1112 Q227 1201 142 1116 L118 1102 Z"/><path d="M277 1052 L307 994 L350 1060"/><path d="M393 1065 Q405 1037 417 1074"/><path d="M221 1123 L255 1170 L281 1133"/><path d="M306 1138 L329 1181 L352 1130"/><path d="M383 1128 L402 1166 L426 1119"/></g>')
add('<path d="M166 1093 Q270 1064 451 1093 Q271 1119 167 1113" fill="#e3b5ad" opacity=".6"/><path d="M210 1055 Q244 1093 218 1139" fill="none" stroke="#315e61" stroke-width="4"/><circle cx="175" cy="1082" r="9" fill="#123f49"/>')
for x,y in [(254,1071),(280,1072),(305,1080),(324,1070),(350,1084),(374,1080),(392,1094),(285,1117),(326,1113),(360,1112)]:add(f'<circle cx="{x}" cy="{y}" r="3" fill="#507475"/>')
for x,y,n in [(219,1092,1),(253,1158,2),(331,1091,3),(307,1008,4),(329,1170,5),(401,1154,6),(408,1045,7),(509,1097,8)]:dot(x,y,n)
labels(951,[('Gill cover (operculum)','Covers the gills'),('Pectoral fin','A paired fin; one side shown'),('Scales','Cover the body'),('Dorsal fin','On the back'),('Pelvic fin','A paired fin; one side shown'),('Anal fin','On the underside, toward the tail'),('Adipose fin','Small fleshy fin behind the dorsal fin'),('Caudal fin','The tail fin')])
txt(55,1437,'Original schematic for MBA Hub V2 • Review candidate • Not to scale',21,weight=700)
txt(55,1472,'General anatomy only; not a species-identification plate. Fin size and body proportions are simplified.',18,color='#506872')
add('</svg>')
Path('docs/review/seahorse-trout-original-candidate.svg').write_text('\n'.join(p))
