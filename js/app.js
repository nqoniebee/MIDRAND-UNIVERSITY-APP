/* Shared interactions: navigation, accessible notices, downloads and staff search. */
'use strict';
(() => {
  const toast = document.querySelector('#toast');
  let toastTimer;
  window.DepartmentUI = {
    notify(message) {
      clearTimeout(toastTimer);
      toast.textContent = message;
      toast.hidden = false;
      toastTimer = setTimeout(() => { toast.hidden = true; }, 5000);
    },
    download(filename, text, type = 'text/plain;charset=utf-8') {
      const blob = new Blob([text], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    element(tag, className, content) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (content !== undefined) node.textContent = content;
      return node;
    }
  };
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#primary-nav');
  const setMenu = open => {
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
      setMenu(false); menu.focus();
    }
  });
  matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) setMenu(false); });

  const events = {
    lab: { title: 'MIDRAND sample open lab: first machine learning model', start: '20261105T120000Z', end: '20261105T130000Z', location: 'Computing Lab 2 (sample location)' },
    showcase: { title: 'MIDRAND sample student project showcase', start: '20261112T080000Z', end: '20261112T100000Z', location: 'Innovation Studio (sample location)' }
  };
  const escapeICS = text => text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  document.querySelectorAll('[data-calendar]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.dataset.calendar, item = events[id];
      const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
      const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MIDRAND Student Project//Department Demo//EN','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:midrand-demo-${id}-2026@university.example`,`DTSTAMP:${stamp}`,`DTSTART:${item.start}`,`DTEND:${item.end}`,`SUMMARY:${escapeICS(item.title)}`,`LOCATION:${escapeICS(item.location)}`,'DESCRIPTION:Illustrative academic event for a DSI236 demonstration. This is not an official invitation.','END:VEVENT','END:VCALENDAR'];
      DepartmentUI.download(`midrand-${id}-reminder.ics`, lines.join('\r\n')+'\r\n', 'text/calendar;charset=utf-8');
      DepartmentUI.notify('Calendar reminder downloaded. This does not register attendance.');
    });
  });

  const peopleGrid = document.querySelector('#people-grid');
  if (peopleGrid) {
    const input = document.querySelector('#people-search');
    const { element } = DepartmentUI;
    function renderPeople() {
      const query = input.value.trim().toLowerCase();
      const matches = DepartmentData.staff.filter(person => `${person.name} ${person.role} ${person.expertise}`.toLowerCase().includes(query));
      peopleGrid.replaceChildren();
      document.querySelector('#people-count').textContent = `${matches.length} of ${DepartmentData.staff.length} sample profiles`;
      for (const person of matches) {
        const card = element('article','person-card');
        const avatar = element('div',`avatar avatar-${person.color}`,person.initials);
        avatar.setAttribute('aria-hidden','true');
        card.append(avatar, element('p','eyebrow',person.area), element('h3','',person.name), element('p','person-role',person.role), element('p','',person.expertise), element('p','office-hours',`Example office hours: ${person.office}`));
        const link=element('a','text-link','Ask about this area ↗');
        link.href='contact.html?topic=Module%20information';
        card.append(link); peopleGrid.append(card);
      }
      if (!matches.length) peopleGrid.append(element('p','empty-state','No profiles match. Try a subject such as statistics, web development or Python.'));
    }
    input.addEventListener('input',renderPeople);
    renderPeople();
  }
})();
