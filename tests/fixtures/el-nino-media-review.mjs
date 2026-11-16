export const pendingElNinoMedia = Array.from({length: 18}, (_, index) =>
  'el-nino-slide-' + String(index + 1).padStart(2, '0'));

export const pendingElNinoReasons = pendingElNinoMedia.map(id => 'media permission review: ' + id);
