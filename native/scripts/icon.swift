import AppKit
let destination = CommandLine.arguments[1]
try FileManager.default.createDirectory(atPath: destination, withIntermediateDirectories: true)
func color(_ r:CGFloat,_ g:CGFloat,_ b:CGFloat)->NSColor {NSColor(calibratedRed:r,green:g,blue:b,alpha:1)}
for size in [16,32,64,128,256,512,1024] {
 let image=NSImage(size:NSSize(width:size,height:size));image.lockFocus()
 let scale=CGFloat(size)/1024
 let transform=NSAffineTransform();transform.scale(by:scale);transform.concat()
 let bg=NSBezierPath(roundedRect:NSRect(x:32,y:32,width:960,height:960),xRadius:210,yRadius:210)
 color(0.94,0.96,0.91).setFill();bg.fill()
 NSGraphicsContext.saveGraphicsState()
 let rotate=NSAffineTransform();rotate.translateX(by:512,yBy:512);rotate.rotate(byDegrees:-27);rotate.concat()
 let ring=NSBezierPath(ovalIn:NSRect(x:-365,y:-170,width:730,height:340));ring.lineWidth=17;color(0.66,0.72,0.65).setStroke();ring.stroke()
 NSGraphicsContext.restoreGraphicsState()
 func ball(_ x:CGFloat,_ y:CGFloat,_ r:CGFloat,_ c:NSColor) {
  let path=NSBezierPath(ovalIn:NSRect(x:x-r,y:y-r,width:r*2,height:r*2));c.setFill();path.fill()
  NSColor.white.withAlphaComponent(0.35).setFill();NSBezierPath(ovalIn:NSRect(x:x-r*0.45,y:y+r*0.25,width:r*0.5,height:r*0.25)).fill()
 }
 ball(490,535,180,color(0.93,0.48,0.37));ball(775,355,83,color(0.64,0.74,0.83));ball(230,680,66,color(0.70,0.64,0.81));ball(620,825,41,color(0.90,0.77,0.43))
 image.unlockFocus()
 let bitmap=NSBitmapImageRep(data:image.tiffRepresentation!)!;let data=bitmap.representation(using:.png,properties:[:])!
 if size<=512 {try data.write(to:URL(fileURLWithPath:destination+"/icon_\(size)x\(size).png"))}
 if size>=32 {let half=size/2;try data.write(to:URL(fileURLWithPath:destination+"/icon_\(half)x\(half)@2x.png"))}
}
