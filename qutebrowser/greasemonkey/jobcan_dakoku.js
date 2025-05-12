// ==UserScript==
// @name         Jobcan 自動打刻
// @namespace    http://tampermonkey.net/
// @version      2024-07-01
// @description  try to take over the world!
// @author       monz
// @match        https://ssl.jobcan.jp/client/adit-manage*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=jobcan.jp
// @grant        none
// ==/UserScript==

const $ = jQuery;

const getRandomTime = (startHour, startMinute, endMinute) => {
  const randomMinute = Math.floor(Math.random() * (endMinute - startMinute + 1)) + startMinute;
  return `${String(startHour).padStart(2, '0')}:${String(randomMinute).padStart(2, '0')}`;
};

const action = () => {
  const table = $('#adit_manage_table_step tbody tr').filter(function() {
    return $(this).attr('id') !== undefined;
  });
  const tr = Array.from(table);

  for (const t of tr) {
    const td = $(t).find('td');
    const holiday = $(td[1]).find('select').val();
    const sickday = $(td[2]).text().trim();
    if (holiday !== 'none' || sickday) {
      console.log('skip');
      continue;
    }

    // 09:00〜09:29の間の時間をランダムに設定
    const startTime = getRandomTime(9, 0, 29);
    $(td[5]).find('input').val(startTime).change();

    // startTimeから9時間後の30分の間の時間をランダムに設定
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const endHour = startHour + 9;
    const endTime = getRandomTime(endHour, startMinute, startMinute + 29);
    $(td[6]).find('input').val(endTime).change();
    $(td[8]).find('input').val('01:00').change();
  }
};

const setButton = () => {
  const button = $(
    `<button type="button" class="btn btn-danger float-right" >【締め作業】自動打刻</button>`
  );
  button.on('click', () => {
    action();
  });
  $('h2').append(button);
};
(function() {
  setButton();

  setTimeout(() => {
    action();
  }, 50000);
})();
