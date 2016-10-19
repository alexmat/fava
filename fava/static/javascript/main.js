import e from './events';
import initCharts from './charts';
import initClipboard from './clipboard';
import initDocumentsUpload from './documents-upload';
import initEditor from './editor';
import { initFilters, updateFilters } from './filters';
import initJournal from './journal';
import { initKeyboardShortcuts, updateKeyboardShortcuts } from './keyboard-shortcuts';
import initRouter from './router';
import makeSortable from './sort';
import initTreeTable from './tree-table';

const $ = require('jquery');

// These parts of the page should not change.
// So they only need to be initialized once.
function initPage() {
  initFilters();
  initKeyboardShortcuts();

  $('.overlay-wrapper').on('click', (event) => {
    event.preventDefault();
    if (event.target.classList.contains('overlay-wrapper') ||
        event.target.classList.contains('close-overlay')) {
      $('.overlay-wrapper').removeClass('shown');
    }
  });

  $('#aside-button').on('click', (event) => {
    event.preventDefault();
    $('aside').toggleClass('active');
    $('#aside-button').toggleClass('active');
  });

  $('#notifications').on('click', 'li', (event) => {
    event.currentTarget.remove();
  });
}

e.on('page-loaded', () => {
  updateFilters();
  $('table.sortable').each((_, el) => {
    makeSortable(el);
  });
  updateKeyboardShortcuts();

  initCharts();
  initClipboard();
  initDocumentsUpload();
  initEditor();
  initJournal();
  initTreeTable();

  document.title = window.documentTitle;
  $('h1 strong').html(window.pageTitle);
  document.getElementById('reload-page').classList.add('hidden');

  $('aside a').each((_, el) => {
    el.classList.remove('selected');
    if (el.getAttribute('href').startsWith(window.location.pathname)) {
      el.classList.add('selected');
    }
  });
});

e.on('file-modified', () => {
  $('aside').load(`${window.location.pathname} aside`);
});

// Notifications
e.on('info', (msg) => {
  $('#notifications').append(`<li>${msg}</li>`);
});

e.on('error', (msg) => {
  $('#notifications').append(`<li class="error">${msg}</li>`);
});

function doPoll() {
  $.get(window.changedUrl, (data) => {
    if (data.success && data.changed) {
      document.getElementById('reload-page').classList.remove('hidden');
      e.trigger('file-modified');
    }
  })
    .always(() => { setTimeout(doPoll, 5000); });
}

$(document).ready(() => {
  initPage();
  initRouter();
  e.trigger('page-loaded');
  setTimeout(doPoll, 5000);
});
