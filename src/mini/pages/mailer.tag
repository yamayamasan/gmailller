<mailer>
  <div class="columns height100per">
    <div class="column col-3 col-xs-3 overflow-auto" id="target">
      <mailer-nav></mailer-nav>
    </div>
    <div class="column col-9 col-xs-9">
      <mailer-box></mailer-box>
      <div id="markdown"></div>
    </div>
    <div class="footerItems">
      <button onclick={ openMarkdown }>Markdown</button>
    </div>
  </div>
  <script>
    openMarkdown() {
      const markdownTag = riot.mount('#markdown', 'markdown');
    }

    search() {
      (async function() {
        const mailbox = state.get('mailbox.target');
        const listMails = await gmail.search(mailbox.path, {
          unseen: true
        });
      }).call();
    }

    const obsDisconnected = () => {
      gmailler.disconnected('main');
      gmailler.onDisconnected((r) => {
        gmailler.connection('main', {
          auth: storage.get('gmail')
        });
        gmailler.onConnection((key) => {
          console.log('reconnect')
        });
      });
    }

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
      observer('obs.INBOX');
      // obsDisconnected();
      $$('body').classList.remove('start_page', 'empty', 'init-loading');
      communicator.send('window:resize:start', {
        width: 800,
        height: 600,
        resizable: true,
      });
    });
  </script>
</mailer>