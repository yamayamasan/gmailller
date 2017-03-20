<mailer>
  <div class="columns height100per">
    <div class="column col-3 col-xs-3 overflow-auto" id="target">
      <ul class="nav">
        <li class="nav-item" each={mailbox, i in view.listMailboxes}>
          <a href="#" onclick={ openMailBox.bind(this, i) }>
            <span class={ view.selectedMailBox.list[i] }   class="badge" data-badge="{mailbox.unreadCount}" if={ mailbox.unreadCount > 0 }>{ mailbox.name }</span>
            <span class={ view.selectedMailBox.list[i] } if={ mailbox.unreadCount == 0 }>{ mailbox.name }</span>
          </a>
        </li>
      </ul>
    </div>
    <div class="column col-9 col-xs-9" if={ view.showMailBox }>
      <div class="panel height100per">
        <div class="panel-header text-center">
          <div class="panel-title mt-10">{ view.mailboxLabel }
            <i class="icon icon-markunread"></i>
          </div>
        </div>
        <nav class="panel-nav">
          <ul class="tab tab-block">
            <li class="tab-item" each={tab, i in view.tabs}>
              <a href="#panels" onclick={ toggleTab.bind(this, i) }>{ i }</a>
            </li>
          </ul>
        </nav>
        <div class="panel-body">
          <div each={mail, i in view.listMails}>
                <label class="form-checkbox">
      <input type="checkbox" />
      <i class="form-icon"></i> Remember me
    </label>
            <div class="tile tile-centered mail_{ mail.UID } mailitem">
              <div class="tile-content" onclick={ toggleMail.bind(this, mail.UID) } data-uid={ mail.UID }>
                <div class="tile-meta">{ mail.from.name }</div>
                <div class="tile-meta">
                  <time>{ helper.date(mail.date) }</time>
                </div>
                <div class="tile-title">{ mail.title }</div>
              </div>
              <div class="tile-action" if={ !mail.read }>
                <button class="btn btn-link btn-action btn-lg"><i class="icon icon-mail_outline"></i></button>
              </div>
            </div>
            <!-- mail contents-->
            <div class="mail-contents__{ mail.UID }"></div>
            <!-- //mail contents-->
            <div class="divider"></div>
          </div>
        </div>
        <div class="panel-footer">
          <button class="btn btn-primary btn-block" onclick={ moreMailBox }>More</button>
        </div>
      </div>
    </div>
    <div class="toast toast-primary toastNewMail" if={ view.toastNewMail.show }>
      <button class="btn btn-clear float-right"></button>
      <i class="icon icon-markunread"></i> {view.toastNewMail.subject}
    </div>
    <!--<div>
      <button class="btn btn-primary btn-block" onclick={ helper.logout }>Logout</button>
    </div>-->
  </div>

  <script>
          // global
          helper = new Helper(this);

          // private
          const {
            ipcRenderer
          } = require('electron');
          const mailContents = {};
          const gmail = Gmail.getInstance('main');
          const observars = {};
          const view = new View({
            listMailboxes: [],
            listMails: [],
            mailboxLabel: null,
            showMailBox: false,
            content: null,
            tabs: {
              2016: false,
              2017: true,
              all: false,
            },
            selectedMailBox: {
              n: null,
              list: {},
            },
            toastNewMail: {
              subject: null,
              show: false
            }
          }, this);

          state.initialize({
            mailbox: {
              list: [],
              from: null,
            },
          });

          /*********************************
           * できたら共通化
           *********************************/
          toggleTab(tab, e) {
            console.log(tab);
          }

          toggleTabClassHelper(tab) {
            if (tab) return 'active';
            return '';
          }

          /*********************************
           * //できたら共通化
           *********************************/

          /*********************************
           * プライベート
           *********************************/
          async function setListmailboxes() {
            const listMailboxes = await gmail.listMailboxes();

            const selectedMailBox = view.get('selectedMailBox');
            for (let i = 0; i < listMailboxes.length;i++) {
              const mail = listMailboxes[i];

              if (mail.name.match(/Mailbox|Gmail|Airmail/) == null) {
                const count = await gmail.countUnRead(mail.path);
                mail.unreadCount = count;
              }

              selectedMailBox.list[mail.path] = null;
            }
            console.log(listMailboxes);
            view.sets({
              listMailboxes, selectedMailBox
            });
          };

          async function getMailBox(mailbox, from) {
            const orglistMails = view.get('listMails');
            const addlistMails = await gmail.listMessages(mailbox.path, from);
            const rAddlistMails = _.reverse(addlistMails);
            return orglistMails.concat(rAddlistMails);
          }


          /*********************************
           * //プライベート
           *********************************/

          /*********************************
           * view action
           *********************************/
          toggleMail(uid, e) {
            (async function () {
              if (!mailContents[uid]) {
                const mail = await gmail.getMessage(uid);
                const div = document.createElement('div');
                div.setAttribute('id', `mail-content___${uid}`);
                $$(`.mail-contents__${uid}`).appendChild(div);

                mailContents[uid] = riot.mount(`#mail-content___${uid}`, 'mail-content', {
                  mail,
                  uid,
                });
              } else {
                mailContents[uid][0].unmount(false);
                mailContents[uid] = null;
              }
            }).call();
          }

          search() {
            (async function () {
              const mailbox = state.get('mailbox.list');
              const listMails = await gmail.search(mailbox.path, {
                unseen: true
              });
            }).call();
          }

          moreMailBox() {
            (async function () {
              const mailbox = state.get('mailbox.list');
              const from = state.get('mailbox.from');
              const listMails = await getMailBox(mailbox, from);
              view.sets({
                listMails
              });
              state.set('mailbox.from', from - 10);
            }).call();
          }

          openMailBox(key, e) {
            (async function () {
              e.preventDefault();
              view.restore('listMails');
              const mailbox = view.get('listMailboxes')[key];
              const listMails = await getMailBox(mailbox, -10);
              console.log('listMails', listMails);
              state.set('mailbox.list', mailbox);
              state.set('mailbox.from', -20);
              const selectedMailBox = view.get('selectedMailBox');
              if (selectedMailBox.n !== null) selectedMailBox.list[selectedMailBox.n] = null;
              selectedMailBox.n = key;
              selectedMailBox.list[key] = 'label label-primary';
              view.sets({
                showMailBox: true,
                mailboxLabel: mailbox.name,
                listMails,
                selectedMailBox,
              });
            }).call();
          }

          const toast = (msg) => {
            const toastNewMail = {
              subject: msg.title || '件名なし',
              show: true,
            };
            view.sets({
              toastNewMail
            });
            let timer = setTimeout(() => {
              view.sets({
                toastNewMail: {
                  subject: null,
                  show: false
                }
              });
              timer = null;
            }, 5000);
          };

          const observer = (name) => {
            (async function () {
              observars[name] = Gmail.getInstance(name);
              const auth = storage.get('gmail');
              observars[name].setOauthConfig(auth.user, auth);
              await observars[name].createConnection();
              observars[name].disconnected(async () => {
                await observars[name].createConnection();
              });
              observars[name].observe((message) => {
                console.log(message);
                toast(message);
              });
            }).call();
          }

          this.on('mount', function () {
            setListmailboxes();
            observer('obs.INBOX');
            $$('body').classList.remove('start_page', 'empty', 'init-loading');
            communicator.send('window:resize:start', {
              width: 800,
              height: 600,
              resizable: true,
            });
          });
  </script>
</mailer>