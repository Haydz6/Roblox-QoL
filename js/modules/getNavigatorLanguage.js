var getNavigatorLanguages = function() {
    if (typeof navigator === 'object') {
      var t = 'anguage', n = navigator, f;
      f = n['l' + t + 's'];
      return f && f.length ? f : (t = n['l' + t] ||
        n['browserL' + t] ||
        n['userL' + t]) ? [ t ] : t;
    }
}