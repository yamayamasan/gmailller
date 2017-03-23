<markdown>
  <div class="columns col-12 col-xs-12　height100per markdown-box">
    <div id="editor" class="height100per"></div>
  </div>

  <div id="markdown-tools">

  </div>
  <script>
    require('ace-min-noconflict');
    require('ace-min-noconflict/mode-markdown');

    let editor = null;
    this.on('mount', () => {
      editor = ace.edit("editor");
      editor.getSession().setMode('ace/mode/markdown');
      editor.getSession().setUseWrapMode(true);
    });
  </script>
</markdown>