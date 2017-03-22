<mailer-nav>
  <ul class="nav">
    <li class="nav-item" each={mailbox, i in view.listMailboxes}>
      <a href="#" onclick={ openMailBox.bind(this, i) }>
        <!-- 一旦[i]で（本当はuidみたいなのでやりたい） -->
        <span id="mailbox_span_{ i }" class={ view.selectedMailBox.list[i] }>{ mailbox.name }</span>
      </a>
    </li>
  </ul>

  <script>
    const view = new View({
      listMailboxes: [],
      selectedMailBox: {
        n: null,
        list: {},
      },
    }, this);

    openMailBox(key, e) {
      (async function() {
        e.preventDefault();
        view.restore('listMails');
        const mailbox = view.get('listMailboxes')[key];
        // const listMails = gmailler.getMailboxSync('main', {
        //   listMails: [],
        //   mailbox,
        //   from: -10,
        // });
        gmailler.getMailbox('main', {
          listMails: [],
          mailbox,
          from: -10,
        });
        state.set('mailbox', {
          target: mailbox,
          from: -20,
        });
        const selectedMailBox = view.get('selectedMailBox');
        const ele = document.querySelector(`#mailbox_span_${ key }`);
        const oldClass = ele.classList.value;
        if (selectedMailBox.n !== null) selectedMailBox.list[selectedMailBox.n] = oldClass;
        selectedMailBox.n = key;
        selectedMailBox.list[key] = `${oldClass} label label-primary`;
        view.sets({
          selectedMailBox,
        });
      }).call();
    }

    function setViewInit() {
      gmailler.onListMailboxes((listMailboxes) => {
        const selectedMailBox = view.get('selectedMailBox');
        listMailboxes.forEach((mail) => {
          selectedMailBox.list[mail.path] = null;
        });
        view.sets({
          listMailboxes,
          selectedMailBox
        });
      });
      gmailler.onUnreadlistMailboxes((listMailboxes) => {
        listMailboxes.forEach((mailbox, i) => {
          if (mailbox.unreadCount > 0) {
            // 一旦[i]で（本当はuidみたいなのでやりたい）
            // const ele = document.querySelector(`#mailbox_span_${ mailbox.path }`);
            const ele = document.querySelector(`#mailbox_span_${ i }`);
            ele.setAttribute('data-badge', mailbox.unreadCount);
            ele.classList.add('badge');
          }
          const d = _.pick(mailbox, ['uuid', 'name', 'path', 'unreadCount', 'delimiter']);
          d.updated_at = new Date();
          d.sort = i + 1;
          list.push(d);
        });
        // db.bulkPut('mailboxes', list);
      });
    }

    this.on('mount', function() {
      setViewInit();
    });
  </script>
</mailer-nav>