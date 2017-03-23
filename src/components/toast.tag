<toast>
  <div class="toast toast-primary toastNewMail" if={ view.show }>
    <button class="btn btn-clear float-right"></button>
    <i class="icon icon-markunread"></i> {view.subject}
  </div>

  <script>
    const view = new View({
      show: false,
      subject: null,
    }, this);

    state.observe('toast.message', (options) => {
      console.log(subject);
    });
  </script>
</toast>