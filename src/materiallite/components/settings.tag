<settings>

  <!--<div class="column col-12 col-xs-12 docs-content height100per" if={ view.isViewLogin }>
  </div>-->

  <div class="panel height100per" if={ view.showSetting }>
    <div class="panel-header text-center">
      <div class="panel-title mt-10">
        Settings
      </div>
    </div>
    <div class="panel-body">
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

  <script>
    const view = new Vue({
      showSetting: false,
    }, this);

    state.observe('showSetting', (name) => {

    });
  </script>
</settings>