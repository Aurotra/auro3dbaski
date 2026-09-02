import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const assets =
  "C:/Users/Berk_/.cursor/projects/c-Users-Berk-Projects-Auro3dbaski/assets";
const outDir = path.join("public", "images", "workshop");
fs.mkdirSync(outDir, { recursive: true });

const jobs = [
  {
    name: "miras-kutu.webp",
    src: "c__Users_Berk__AppData_Roaming_Cursor_User_workspaceStorage_08d581445808afdd450f199bb9890ce0_images_WhatsApp_Image_2026-09-02_at_23.32.05__5_-54ccdba4-1b3b-43fa-9b20-f335eed3e3df.jpg",
  },
  {
    name: "sardalya.webp",
    src: "c__Users_Berk__AppData_Roaming_Cursor_User_workspaceStorage_08d581445808afdd450f199bb9890ce0_images_WhatsApp_Image_2026-09-02_at_23.32.06-9f9958ba-f0a2-466e-a5e3-dff37443d7e6.jpg",
  },
  {
    name: "tekneler.webp",
    src: "c__Users_Berk__AppData_Roaming_Cursor_User_workspaceStorage_08d581445808afdd450f199bb9890ce0_images_WhatsApp_Image_2026-09-02_at_23.32.05__4_-ff08646f-7fc8-4e67-b14e-e91137ea10c7.jpg",
  },
  {
    name: "keman.webp",
    src: "c__Users_Berk__AppData_Roaming_Cursor_User_workspaceStorage_08d581445808afdd450f199bb9890ce0_images_WhatsApp_Image_2026-09-02_at_23.32.05__3_-7c30937a-cd19-49f7-b8a1-2317461e3290.jpg",
  },
  {
    name: "vazo.webp",
    src: "c__Users_Berk__AppData_Roaming_Cursor_User_workspaceStorage_08d581445808afdd450f199bb9890ce0_images_WhatsApp_Image_2026-09-02_at_23.32.05__2_-09e55f91-6224-4a02-86f1-bd734d0ebb01.jpg",
  },
  {
    name: "lambalar.webp",
    src: "c__Users_Berk__AppData_Roaming_Cursor_User_workspaceStorage_08d581445808afdd450f199bb9890ce0_images_WhatsApp_Image_2026-09-02_at_23.32.05-26f5d8f4-76db-4681-84e6-07c3a4ba2aea.jpg",
  },
];

for (const job of jobs) {
  const dest = path.join(outDir, job.name);
  await sharp(path.join(assets, job.src))
    .rotate()
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(dest);
  const m = await sharp(dest).metadata();
  console.log(job.name, m.width + "x" + m.height);
}
