<toast>
  <div class="toast toastNewMail" if={ view.show }>
    <button class="btn btn-clear float-right"></button>
    <div class="text-left" if={ view.showLoading }>
      <div class="loading"></div>
    </div>
    <!--<i class="icon icon-markunread"></i>-->
    <div class="text-center">{view.subject}</div>
  </div>

  <script>
    const view = new View({
      show: false,
      showLoading: false,
      // subject: null,
      subject: 'loading...',
    }, this);

    state.observe('toast.message', (options) => {
      console.log(subject);
    });
  </script>
</toast>