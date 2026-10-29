// Aviso de cookies (LGPD): aparece até a pessoa escolher; a escolha fica salva no navegador
(function () {
  if (localStorage.getItem('cookies')) return;

  var aviso = document.createElement('div');
  aviso.className = 'cookies';
  aviso.setAttribute('role', 'region');
  aviso.setAttribute('aria-label', 'Aviso de cookies');
  aviso.innerHTML =
    '<p class="cookies__texto">Usamos cookies para entender como o site é usado e melhorar sua visita.</p>' +
    '<div class="cookies__botoes">' +
      '<button type="button" class="cookies__btn" data-escolha="recusado">Recusar</button>' +
      '<button type="button" class="cookies__btn cookies__btn--aceitar" data-escolha="aceito">Aceitar</button>' +
    '</div>';

  aviso.addEventListener('click', function (e) {
    var escolha = e.target.getAttribute('data-escolha');
    if (!escolha) return;
    localStorage.setItem('cookies', escolha);
    if (escolha === 'aceito') gtag('consent', 'update', { analytics_storage: 'granted' });
    aviso.remove();
  });

  document.body.appendChild(aviso);
})();
