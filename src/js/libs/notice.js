const notifier = require('node-notifier');

class Notice {

  static up(title, message, cb = undefined) {
    notifier.notify({
      title, // タイトル
      message, // メッセージ
      // icon: path.join(__dirname, '/img/icon.jpg'), // 画像  * 絶対パス (windowsのballoonsでは動きません)
      sound: true, // Macのnotification center 又は Windowsトースターのみ
      wait: true, // 通知イベントのオプション * クリックイベントやタイムアウト等
      // 'open': 'file://' + __dirname + '/img/icon.jpg' ファイルを開かせることも出来ます
    }, cb);
  }

  static onclick(cb) {
    notifier.on('click', (notifierObject, options) => {
      cb(notifierObject, options, notifier);
    });
  }

  static timeout(cb) {
    notifier.on('timeout', (notifierObject, options) => {
      cb(notifierObject, options, notifier);
    });
  }
}
// Object
module.exports = Notice;