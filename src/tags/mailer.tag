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
          <div class="tile tile-centered" each={mail, i in view.listMails}>
            <div class="tile-content" onclick={ openMail.bind(this, mail.UID) } data-uid={ mail.UID }>
              <div class="tile-meta">{ mail.from.name }</div>
              <div class="tile-meta"><time>{ helper.date(mail.date) }</time></div>
              <div class="tile-title">{ mail.title }</div>
            </div>
            <div class="tile-action">
              <button class="btn btn-link btn-action btn-lg"><i class="icon icon-mail_outline"></i></button>
            </div>
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
    const co = require('co');
    const iconv = require('iconv-lite');
    // const jconv = require('jconv');
    const gmail = Gmail.getInstance('main');
    const gmailAuth = state.get('gmail');
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

    view.init();

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
    function setListmailboxes() {
      co(function*() {
        const listMailboxes = yield gmail.listMailboxes();
        view.sets({
          listMailboxes
        });
      });
    };

    function getMailBox(mailbox, from) {
      return co(function*() {
        const orglistMails = view.get('listMails');
        const addlistMails = yield gmail.listMessages(mailbox.path, from);
        const rAddlistMails = _.reverse(addlistMails);
        return orglistMails.concat(rAddlistMails);
      });
    }


    /*********************************
     * //プライベート
     *********************************/

    /*********************************
     * view action
     *********************************/
    openMail(uid, e) {
      co(function*() {
        const mail = yield gmail.fetchMessage(uid);
        const div = document.createElement('div');
        div.innerHTML = mail.html;
        // console.log(jconv.convert(mail.html, 'ISO-2022-JP', 'UTF-8').toString());
        // console.log(mail.html);
        // console.log(mail.html);
        // document.querySelector('#mail-content').appendChild(div);
        document.querySelector('#mail-content').appendChild(div);
        // console.log(mail);
        // setViews({
        //   content: mail.html
        // });
      });
    }

    search() {
      co(function*() {
        const mailbox = state.get('mailbox');
        const listMails = yield gmail.search(mailbox.path, {
          unseen: true
        });
        console.log(listMails);
      });
    }

    moreMailBox() {
      co(function*() {
        const mailbox = state.get('mailbox');
        const from = state.get('mailbox.from');
        const listMails = yield getMailBox(mailbox, from);
        view.sets({
          listMails
        });
        state.set('mailbox.from', from - 10);
      });
    }

    openMailBox(e) {
      co(function*() {
        e.preventDefault();
        view.restore('listMails');
        const key = e.target.getAttribute('data-key');
        const mailbox = view.get('listMailboxes')[key];
        const listMails = yield getMailBox(mailbox, -10);
        state.set('mailbox', mailbox);
        state.set('mailbox.from', -20);
        view.sets({
          showMailBox: true,
          mailboxLabel: mailbox.name,
          listMails
        });
      });
    }

    const toast = (message) => {

    };

    const observar = (name) => {
      co(function*() {
        observars[name] = Gmail.getInstance(name);
        const auth = storage.get('gmail');
        yield observars[name].createConnection(auth.user, auth);
        observars[name].watcher((message) => {
          console.log(message);
          toast(message);
        });
      });
    }

    this.on('mount', function() {
      setListmailboxes();
      observar('obs.INBOX');
    });
  </script>
</mailer>