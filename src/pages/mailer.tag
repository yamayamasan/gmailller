<mailer>
  <div class="columns height100per">
    <div class="column col-3 col-xs-3 overflow-auto" id="target">
      <mailer-nav></mailer-nav>
    </div>
    <!--<div class="column col-9 col-xs-9" if={ view.showMailBox }>-->
    <div class="column col-9 col-xs-9">
      <mailer-box></mailer-box>
    </div>
  </div>
  <script>
    // global
    helper = new Helper(this);

    // private
    const mailContents = {};
    const view = new View({
      // listMailboxes: [],
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

    // state.initialize({
    //   mailbox: {
    //     list: [],
    //     from: null,
    //   },
    //   listMailboxes: {},
    // });

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
    function reconnect() {
      /*
      const auth = storage.get('gmail');
      communicator.send('gmail:disconnected', {
        key: 'main',
        params: {
          auth,
        }
      });
      communicator.on('gmail:disconnected:res', (ev, disconnected) => {
        communicator.send('gmail:connection', {
          key: 'main',
          params: {
            auth,
          }
        });

        communicator.on('gmail:connection:res', (e, key) => {
          reconnect();
        });
      });
      */
    }

    function diffListMailboxes(curListMailboxes) {
      const oldListMailboxes = state.get('listMailboxes');
      const newListMailboxes = {};
      _.forEach(curListMailboxes, (mailbox, i) => {
        if (!oldListMailboxes[mailbox.uuid]) {
          // oldがなければnewに突っ込む
          newListMailboxes[mailbox.uuid] = mailbox;
        } else {
          // oldがあれば比較
          if (oldListMailboxes[mailbox.uuid].unreadCount !== mailbox.unreadCount) {
            // 未読数に差がある
            newListMailboxes[mailbox.uuid] = mailbox;
          }
        }
      });
      return newListMailboxes;
    }

    async function setViewDb() {
      const mailboxes = await db.all('mailboxes');
      const hashMailboxes = _.mapKeys(mailboxes, (mailbox) => {
        return mailbox.uuid;
      });
      // const mearge = diffListMailboxes(hashMailboxes);
      state.set('listMailboxes', hashMailboxes);
    }

    // function setViewInit() {
    //   gmailler.onListMailboxes((listMailboxes) => {
    //     const selectedMailBox = view.get('selectedMailBox');
    //     listMailboxes.forEach((mail) => {
    //       selectedMailBox.list[mail.path] = null;
    //     });
    //     view.sets({
    //       listMailboxes,
    //       selectedMailBox
    //     });
    //   });
    //   gmailler.onUnreadlistMailboxes((listMailboxes) => {
    //     listMailboxes.forEach((mailbox, i) => {
    //       if (mailbox.unreadCount > 0) {
    //         // 一旦[i]で（本当はuidみたいなのでやりたい）
    //         // const ele = document.querySelector(`#mailbox_span_${ mailbox.path }`);
    //         const ele = document.querySelector(`#mailbox_span_${ i }`);
    //         ele.setAttribute('data-badge', mailbox.unreadCount);
    //         ele.classList.add('badge');
    //       }
    //       const d = _.pick(mailbox, ['uuid', 'name', 'path', 'unreadCount', 'delimiter']);
    //       d.updated_at = new Date();
    //       d.sort = i + 1;
    //       list.push(d);
    //     });
    //     // db.bulkPut('mailboxes', list);
    //   });
    // }

    /*********************************
     * //プライベート
     *********************************/

    /*********************************
     * view action
     *********************************/
    // toggleMail(uid, e) {
    //   if (!mailContents[uid]) {
    //     const params = {
    //       uid
    //     };
    //     gmailler.getMessage('main', params, (mail) => {
    //       const id = `mail-content___${uid}`;
    //       const div = document.createElement('div');
    //       div.setAttribute('id', id);
    //       $$(`.mail-contents__${uid}`).appendChild(div);

    //       params.mail = mail;
    //       mailContents[uid] = riot.mount(`#${id}`, 'mail-content', params);
    //       gmailler.readMail('main', params, (res) => {
    //         console.log(res);
    //       });
    //     });
    //   } else {
    //     mailContents[uid][0].unmount(false);
    //     mailContents[uid] = null;
    //   }
    // }

    search() {
      (async function() {
        const mailbox = state.get('mailbox.target');
        const listMails = await gmail.search(mailbox.path, {
          unseen: true
        });
      }).call();
    }

    // moreMailBox() {
    //   (async function() {
    //     const mailbox = state.get('mailbox');

    //     const listMails = gmailler.getMailboxSync('main', {
    //       listMails: view.get('listMails'),
    //       mailbox: mailbox.target,
    //       from: mailbox.from,
    //     });
    //     view.sets({
    //       listMails
    //     });
    //     state.set('mailbox.from', from - 10);
    //   }).call();
    // }

    // openMailBox(key, e) {
    //   (async function() {
    //     e.preventDefault();
    //     view.restore('listMails');
    //     const mailbox = view.get('listMailboxes')[key];
    //     const listMails = gmailler.getMailboxSync('main', {
    //       listMails: [],
    //       mailbox,
    //       from: -10,
    //     });
    //     state.set('mailbox', {
    //       target: mailbox,
    //       from: -20,
    //     });
    //     const selectedMailBox = view.get('selectedMailBox');
    //     const ele = document.querySelector(`#mailbox_span_${ key }`);
    //     const oldClass = ele.classList.value;
    //     if (selectedMailBox.n !== null) selectedMailBox.list[selectedMailBox.n] = oldClass;
    //     selectedMailBox.n = key;
    //     selectedMailBox.list[key] = `${oldClass} label label-primary`;
    //     view.sets({
    //       showMailBox: true,
    //       mailboxLabel: mailbox.name,
    //       listMails,
    //       selectedMailBox,
    //     });
    //   }).call();
    // }

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
      (async function() {
        const auth = storage.get('gmail');
        gmailler.observer('observer.inbox', {
          auth
        }, (message) => {
          console.log(message);
        });
      }).call();
    }

    this.on('mount', function() {
      // setViewDb();
      // setViewInit();
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