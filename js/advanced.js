SneekMe.advanced = function (callback) {
    var container = document.getElementById('Advanced');
    
    init();
    function init() {
        container.style.display = '';
        setSettings(SneekMe.settings);
        
        document.getElementById('saveadvanced').addEventListener('click', function () {
            var s = getSettings();
            SneekMe.settings = s;
            SneekMe.store.set('settings', s);
            destroy();
        });
        document.getElementById('defaultadvanced').addEventListener('click', function () {
            setSettings(SneekMe.getDefaultSettings());
        });
        document.getElementById('canceladvanced').addEventListener('click', function () {
            destroy();
        });
    }

    function getSettings() {
        var inputs = container.querySelectorAll('input');
        var settings = {};
        for (var i = inputs.length; i--;)
            settings[inputs[i].name] = +inputs[i].value;
        return settings;
    }

    function setSettings(s) {
        var inputs = container.querySelectorAll('input');
        for (var i = inputs.length; i--;)
            inputs[i].value = s[inputs[i].name];
    }

    function destroy() {
        //remove all listeners
        var elClone = container.cloneNode(true);
        container.parentNode.replaceChild(elClone, container);

        elClone.style.display = 'none';
        callback && callback();
    }
}
