// ==UserScript==
// @name         Mastodon Drawable Drawer
// @namespace    https://github.com/tacostea/
// @version      0.24
// @description  畳めるDrawer
// @author       tacostea
// @match        https://*/web/*
// @updateURL    https://github.com/tacostea/drawable-mastodon/raw/master/mastodon-drawable-drawer.user.js
// ==/UserScript==

/*
  Tootしない時にdrawer(一番左のカラム)が畳めたらいいなぁと思って作りました。
  畳んだ状態からNキーによるTootとSキーによる検索をする場合は展開されます。
  M(Minimize)キーは縮小と展開のトグルキーです。
  localstorageを使って縮小/展開状態を保存しているので、リロードしても大丈夫。（本当か？）
  チェックボックスにチェックを入れておくと次回ロード時からCtrl+EnterでTootした時に自動でドロワが縮小します。
  (実際はどこにフォーカスしていてもCtrl+Enterで縮小します。Mキー要らんくね？)
  v0.11: input/textareaにフォーカスしている時にはキー入力に反応しないようにしました。
  v0.12: Toot内容の入力欄を監視することで、返信やDM送信をクリックした時に展開されるようにしました。少し重いかも。
  v0.13: localstorageから状態値を読み込めていなかったので修正。
  v0.14: keyupのリスナを暴走しづらくしました。
  v0.15: TL等から返信等の操作をした時のフォーカスとtextareaの高さを調整しました。
  v0.20: 自動ドロワ縮小機能を追加しました。
  v0.21: しょーもないバグを修正しました。
  v0.22: 前回のtoot内容を保持し続けないように修正しました。
  v0.23: 縮小時に返信等で展開しないバグを修正しました。誰か作者の頭も直してください。
  v0.24: 自動縮小後に展開される問題を修正しました。
*/

'use strict'
window.addEventListener('DOMContentLoaded',(function(){
    var minimized, autominimizeflag, tootarea, searchbox, past_inner, tmp_inner;

    function init(){
        var minimize_btn = document.createElement('button');
        minimize_btn.className = 'button button--block';
        minimize_btn.style.height = '36px';
        minimize_btn.style.lineHeight = '36px';
        minimize_btn.style.width = '45px';
        minimize_btn.style.margin = '20px 0 auto auto';
        minimize_btn.style.backgroundColor = '#676e80';
        minimize_btn.addEventListener('click', minimize_drawer);
        minimize_btn.innerHTML = '<i role="img" class="fa fas fa-chevron-circle-left"></i>';
        document.querySelector('div.drawer__inner').insertBefore(minimize_btn, document.querySelector('div.drawer__inner__mastodon'));

        var auto_chkbox = document.createElement('input');
        auto_chkbox.type = 'checkbox';
        auto_chkbox.id = 'autominimizeflag';
        auto_chkbox.style.margin = '20px 7px auto auto';
        document.querySelector('div.drawer__inner').insertBefore(auto_chkbox, document.querySelector('div.drawer__inner__mastodon'));

        document.addEventListener('keyup', function (e) {
            var active = document.activeElement.nodeName;
            var key = e.which || e.keyCode;
            if (key === 13 && e.ctrlKey && autominimizeflag){
                minimize_drawer();
            }
            if( active != 'TEXTAREA' && active != 'INPUT' ) {
                if (key === 78) { // N
                    click_toot();
                } else if (key === 83) { //S
                    click_search();
                } else if (key === 77) { //M
                    if (minimized){
                        reset_drawer();
                    }else{
                        minimize_drawer();
                    }
                }
            }
        });

        document.querySelector('div.drawer').style.transition = 'width 0.3s cubic-bezier(0.27, 0.01, 0.24, 0.99) 0s';

        if(localStorage.autominimizeflag === 'true'){
            document.querySelector('#autominimizeflag').checked = true;
            autominimizeflag = true;
        }

        past_inner = tootarea.innerHTML;
        setInterval(function(){
            tmp_inner = tootarea.innerHTML;
            if((past_inner != '' || tmp_inner != '' )&& past_inner != tmp_inner && minimized == true){
                past_inner = tmp_inner;
                click_toot();
            }

            minimized ? localStorage.minimized='true' : localStorage.minimized='false';

            document.querySelector('#autominimizeflag').checked
                ? localStorage.autominimizeflag = 'true'
            : localStorage.autominimizeflag = 'false';

        },300);
        console.log('Mastodon Drawable Drawer Initialized.\n*Local Storage Value\nAutoMinimize:%s\nMinimized:%s',localStorage.autominimizeflag,localStorage.minimized);
    }

    function minimize_drawer(){
        if(minimized) return;
        var search_btn = document.createElement('a');
        search_btn.href = '#';
        search_btn.className = 'drawer__tab temp_btn';
        search_btn.addEventListener('click',click_search);
        search_btn.innerHTML = '<i role="img" class="fa fas fa-search"></i>';
        document.querySelector('nav.drawer__header').appendChild(search_btn);

        var toot_btn = document.createElement('a');
        toot_btn.href = '#';
        toot_btn.className = 'drawer__tab temp_btn';
        toot_btn.addEventListener('click',click_toot);
        toot_btn.innerHTML = '<i role="img" class="fa fas fa-edit"></i>';
        toot_btn.style.backgroundColor = '#2b90d9';
        toot_btn.style.color = '#ffffff';
        document.querySelector('nav.drawer__header').appendChild(toot_btn);

        document.querySelector('nav.drawer__header').style.display = 'block';
        document.querySelector('div.drawer__pager').style.visibility = 'hidden';
        document.querySelector('div.search').style.visibility = 'hidden';
        document.querySelector('div.drawer').style.width = '60px';

        var reset_btn = document.createElement('button');
        reset_btn.className = 'button button--block temp_btn';
        reset_btn.style.height = '36px';
        reset_btn.style.lineHeight = '36px';
        reset_btn.style.width = '45px';
        reset_btn.style.backgroundColor = '#676e80';
        reset_btn.addEventListener('click', reset_drawer);
        reset_btn.innerHTML = '<i role="img" class="fa fas fa-chevron-circle-right"></i>';
        document.querySelector('div.drawer').appendChild(reset_btn);

        document.activeElement.blur();
        minimized = true;
    }

    function reset_drawer(){
        if(!minimized) return;
        while(document.querySelector('.temp_btn')){
            var element = document.querySelector('.temp_btn');
            element.parentNode.removeChild(element);
        }
        document.querySelector('nav.drawer__header').style.display = '';
        document.querySelector('div.drawer__pager').style.visibility = '';
        document.querySelector('div.search').style.visibility = '';
        document.querySelector('div.drawer').style.width = '';

        document.activeElement.blur();
        minimized = false;
    }

    function click_search(){
        reset_drawer();
        document.querySelector('input.search__input').focus();
    }

    function click_toot(){
        reset_drawer();
        document.activeElement.blur();
        tootarea.style.height = 'auto';
        var value = tootarea.value;
        tootarea.value = '';
        tootarea.focus();
        tootarea.value = value;
        value = '';

    }

    window.onload = function(){
        minimized = false;
        searchbox = document.querySelector('input.search__input');
        tootarea = document.querySelector('textarea.autosuggest-textarea__textarea');

        init();
        if(localStorage.minimized === 'true') minimize_drawer();
    };

})(), false);
