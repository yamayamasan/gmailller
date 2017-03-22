<start>

  <webview id="authview" class="column col-12 col-xs-12" src={ view.webviewSrc } if={ view.showWebview }></webview>
  <div class="column col-12 col-xs-12 docs-content height100per" if={ view.isViewLogin }>
    <section class="empty" if={ !view.showWebview }>
      <div class="empty-icon">
        <i class="icon icon-drafts"></i>
      </div>
      <h4 class="empty-title">Please login to Gmail</h4>
      <p class="empty-meta">Click the button to invite your friends</p>
      <div class="empty-action">
        <button class="btn btn-primary" onclick={ toAuthGmail }>Login</button>
      </div>
      <!--<div class="empty-action">
        <button class="btn btn-link">Skip</button>
      </div>-->
    </section>
  </div>
  <div if={ !view.isViewLogin }>
    <login-loading></login-loading>
  </div>
  <style>
    #authview {
      height: 395px;
      position: absolute;
      top: 0;
      left: 0;
    }
  </style>
  <script>
    const gmail = Gmail.getInstance('main');
    const gUrl = {
      auth: 'https://accounts.google.com/o/oauth2/auth',
      approval: 'https://accounts.google.com/o/oauth2/approval',
    };
    let email = null;

    const view = new View({
      isViewLogin: false,
      webviewSrc: null,
      showWebview: false,
    }, this);

    toAuthGmail() {
      view.sets({
        webviewSrc: gmail.authGmail(),
        showWebview: true,
      });
      webviewEvent();
    }

    const webviewEvent = () => {
      const authview = $$('#authview');
      authview.addEventListener('load-commit', (e) => {
        authview.addEventListener('did-finish-load', () => {
          if (e.url.match(gUrl.approval)) {
            authview.executeJavaScript("{ code: document.querySelector('#code').value}",
              (res) => {
                getToken(res, authview);
              }
            );
          } else if (e.url.match(gUrl.auth)) {
            authview.executeJavaScript("{ code: document.querySelector('div.gb_xb').innerText}",
              (res) => {
                getEmail(res);
              }
            );
          }
        });
      });
    }

    const getEmail = (res) => {
      email = res;
    }

    const getToken = async(code, authview) => {
      authview.setAttribute('src', null);
      try {
        const res = await Curl.request(code);
        gmail.setOauthConfig(email, res);
        const auth = await gmail.createConnection();
        if (auth.result) {
          const keys = Common.getPackObject(res, ['refresh_token', 'access_token', 'expires_in']);
          storage.save('gmail', Object.assign({
            user: email,
          }, keys));
          toMailerPage();
        }
      } catch (e) {
        console.err('start:', e);
      }
    };

    const toMailerPage = () => {
      riot.mount('mailer');
      this.unmount(true);
    }

    // init call
    (async function isAuthed() {
      const auth = storage.get('gmail');
      if (auth) {
        const params = {
          auth
        };
        gmailler.connection('main', params);
        gmailler.listMailboxes('listMailboxes', params);
        gmailler.unreadlistMailboxes('unreadlistMailboxes', params);
        gmailler.onConnection((key) => {
          toMailerPage();
        });
      } else {
        view.sets({
          isViewLogin: true,
        });
      }
    }).call();
  </script>
</start>