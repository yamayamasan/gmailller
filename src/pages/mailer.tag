<mailer>
  <div class="columns">
    <div class="column col-3 col-xs-3">
      <ul class="nav">
        <li class="nav-item" each={mailbox, i in view.listMailboxes}>
          <a href="#">
            <span onclick={openMailBox} data-key={ i }>{ mailbox.name }</span>
          </a>
        </li>
      </ul>
    </div>
    <div class="column col-9 col-xs-9" if={ view.showMailBox }>
      <div class="panel">
        <div class="panel-header text-center">
          <div class="panel-title mt-10">{ view.mailboxLabel }</div>
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
            <div class="tile tile-centered mail_{ mail.UID }">
              <div class="tile-content" onclick={ openMail.bind(this, mail.UID) } data-uid={ mail.UID }>
                <div class="tile-meta">{ mail.from.name }</div>
                <div class="tile-meta"><time>{ helper.date(mail.date) }</time></div>
                <div class="tile-title">{ mail.title }</div>
              </div>
              <div class="tile-action">
                <button class="btn btn-link btn-action btn-lg"><i class="icon icon-mail_outline"></i></button>
              </div>
            </div>
            <!-- mail contents-->
            <div class="mail-contents__{ mail.UID }">

            </div>
            <!-- //mail contents-->
            <div class="divider"></div>
          </div>
        </div>
        <div class="panel-footer">
          <button class="btn btn-primary btn-block" onclick={ moreMailBox }>More</button>
        </div>
      </div>
    </div>

    <div>
      <button class="btn btn-primary btn-block" onclick={ helper.logout }>Logout</button>
    </div>

    <div id="mail-content"></div>
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
      }
    }, this);

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
      view.sets({
        listMailboxes
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
    openMail(uid, e) {
      (async function() {
        const mail = await gmail.getMessage(uid);
        const div = document.createElement('div');
        div.setAttribute('id', `mail-content___${uid}`);
        $$(`.mail-contents__${uid}`).appendChild(div);

        mailContents[uid] = riot.mount(`#mail-content___${uid}`, 'mail-content', {
          mail,
          uid,
        });
      }).call();
    }

    search() {
      (async function() {
        const mailbox = state.get('mailbox');
        const listMails = await gmail.search(mailbox.path, {
          unseen: true
        });
      }).call();
    }

    moreMailBox() {
      (async function() {
        const mailbox = state.get('mailbox');
        const from = state.get('mailbox.from');
        const listMails = await getMailBox(mailbox, from);
        view.sets({
          listMails
        });
        state.set('mailbox.from', from - 10);
      }).call();
    }

    openMailBox(e) {
      (async function() {
        e.preventDefault();
        const key = e.target.getAttribute('data-key');
        view.restore('listMails');
        const mailbox = view.get('listMailboxes')[key];
        const listMails = await getMailBox(mailbox, -10);
        console.log('listMails', listMails);
        state.set('mailbox', mailbox);
        state.set('mailbox.from', -20);
        view.sets({
          showMailBox: true,
          mailboxLabel: mailbox.name,
          listMails
        });
      }).call();
    }

    const observer = (name) => {
      (async function() {
        observars[name] = Gmail.getInstance(name);
        const auth = storage.get('gmail');
        await observars[name].createConnection(auth.user, auth);
        observars[name].observe((message) => {
          console.log(message);
          // toast(message);
        });
      }).call();
    }

    this.on('mount', function() {
      setListmailboxes();
      observer('obs.INBOX');
      $$('body').classList.remove('start_page');
      communicator.send('window:resize:start', {
        width: 800,
        height: 600,
        resizable: true,
      });
    });
  </script>
</mailer>