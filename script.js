/**
 * Loads config.json and populates index.html, then initializes the map and story.
 */
(function () {
    'use strict';

    let config = null;

    function byId(id) {
        return document.getElementById(id);
    }

    function text(el, value) {
        if (el && value != null) el.textContent = value;
    }

    function html(el, value) {
        if (el && value != null) el.innerHTML = value;
    }

    function fillFromConfig() {
        if (!config) return;

        // Meta
        if (config.meta && config.meta.title) {
            document.title = config.meta.title;
        }

        // Header
        if (config.header) {
            text(byId('headerLogo'), config.header.logo);
        }

        // Hero
        if (config.hero) {
            text(byId('heroLabel'), config.hero.label);
            text(byId('heroTitle'), config.hero.title);
            text(byId('heroSubtitle'), config.hero.subtitle);
            const bylineEl = byId('heroByline');
            if (bylineEl && config.hero.author != null && config.hero.date != null) {
                bylineEl.innerHTML = 'By <span>' + escapeHtml(config.hero.author) + '</span> • ' + escapeHtml(config.hero.date);
            }
        }

        // Article intro
        if (config.articleIntro) {
            text(byId('introLead'), config.articleIntro.lead);
            const dropCapEl = byId('introDropCap');
            if (dropCapEl && config.articleIntro.dropCap != null) {
                const highlight = config.articleIntro.dropCapHighlight;
                let content = config.articleIntro.dropCap;
                if (highlight) {
                    content = content.replace(highlight, '<span class="highlight-text">' + highlight + '</span>');
                }
                dropCapEl.innerHTML = content;
            }
            text(byId('introParagraph'), config.articleIntro.paragraph);
        }

        // Data section
        if (config.dataSection) {
            text(byId('dataSectionTitle'), config.dataSection.title);
            const cardsContainer = byId('dataCards');
            if (cardsContainer && config.dataSection.cards && config.dataSection.cards.length) {
                cardsContainer.innerHTML = config.dataSection.cards.map(function (card) {
                    return '<div class="data-card">' +
                        '<div class="value">' + escapeHtml(card.value) + '</div>' +
                        '<div class="label">' + escapeHtml(card.label) + '</div>' +
                        '</div>';
                }).join('');
            }
        }

        // Map section intro
        if (config.mapSection) {
            text(byId('mapSectionIntro'), config.mapSection.intro);
        }

        // Article return (more content)
        if (config.articleReturn) {
            text(byId('returnTitle'), config.articleReturn.title);
            const returnBody = byId('returnParagraphs');
            if (returnBody && config.articleReturn.paragraphs && config.articleReturn.paragraphs.length) {
                returnBody.innerHTML = config.articleReturn.paragraphs.map(function (p) {
                    return '<p>' + escapeHtml(p) + '</p>';
                }).join('');
            }
        }

        // Timeline
        if (config.timeline) {
            text(byId('timelineTitle'), config.timeline.title);
            const timelineContainer = byId('timelineList');
            if (timelineContainer && config.timeline.items && config.timeline.items.length) {
                timelineContainer.innerHTML = config.timeline.items.map(function (item) {
                    return '<div class="timeline-item">' +
                        '<div class="year">' + escapeHtml(item.year) + '</div>' +
                        '<div class="event">' + escapeHtml(item.event) + '</div>' +
                        '</div>';
                }).join('');
            }
        }

        // Footer
        if (config.footer && config.footer.lines && config.footer.lines.length) {
            const footerEl = byId('footerContent');
            if (footerEl) {
                footerEl.innerHTML = config.footer.lines.map(function (line, i) {
                    return '<p' + (i > 0 ? ' style="margin-top: 15px;"' : '') + '>' + escapeHtml(line) + '</p>';
                }).join('');
            }
        }
    }

    function escapeHtml(str) {
        if (str == null) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function initMapAndStory() {
        if (!config || !config.storyData || !config.storyData.length) return;
        if (typeof maplibregl === 'undefined') {
            console.error('MapLibre GL JS not loaded');
            return;
        }

        var storyData = config.storyData;
        var first = storyData[0];

        // MapTiler API Key - Get your free key at https://cloud.maptiler.com/
        var MAPTILER_KEY = 'HMfa6VzcuB2I0YOnP2jM';

        function getStyleUrl(name) {
            var styles = {
                'Map': 'https://api.maptiler.com/maps/streets-v2/style.json?key=' + MAPTILER_KEY,
                'Satellite': 'raster-arcgis-satellite',
                'Terrain': 'https://api.maptiler.com/maps/topo-v2/style.json?key=' + MAPTILER_KEY,
                'Streets': 'https://api.maptiler.com/maps/openstreetmap/style.json?key=' + MAPTILER_KEY,
                'Light': 'https://api.maptiler.com/maps/dataviz-light/style.json?key=' + MAPTILER_KEY,
                'Dark': 'https://api.maptiler.com/maps/dataviz-dark/style.json?key=' + MAPTILER_KEY
            };
            return styles[name] || styles['Map'];
        }

        function rasterStyle(tileUrlOrUrls, maxzoom) {
            var tiles = Array.isArray(tileUrlOrUrls) ? tileUrlOrUrls : [tileUrlOrUrls];
            var src = { type: 'raster', tiles: tiles, tileSize: 256 };
            if (maxzoom) src.maxzoom = maxzoom;
            return {
                version: 8,
                sources: { raster: src },
                layers: [{ id: 'raster', type: 'raster', source: 'raster' }]
            };
        }

        // Fast raster fallback for Satellite (ArcGIS is great and free)
        var arcgisSatellite = rasterStyle('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', 18);

        var firstStyle = getStyleUrl('Map');
        var map = new maplibregl.Map({
            container: 'map',
            style: firstStyle === 'raster-arcgis-satellite' ? arcgisSatellite : firstStyle,
            center: [first.lng, first.lat],
            zoom: first.zoom
        });

        var currentStyleName = 'Map';
        var popup = new maplibregl.Popup({ closeButton: false });

        function buildStoryGeoJSON() {
            return {
                type: 'FeatureCollection',
                features: storyData.map(function (s, i) {
                    return { type: 'Feature', id: i, geometry: { type: 'Point', coordinates: [s.lng, s.lat] }, properties: {} };
                })
            };
        }

        function addStoryLayers() {
            if (!map.getSource('story-points')) {
                map.addSource('story-points', { type: 'geojson', data: buildStoryGeoJSON(), promoteId: 'id' });
            }
            if (!map.getLayer('story-circles')) {
                map.addLayer({
                    id: 'story-circles',
                    type: 'circle',
                    source: 'story-points',
                    paint: {
                        'circle-radius': ['case', ['boolean', ['feature-state', 'active'], false], 12, 7],
                        'circle-color': '#c41e3a',
                        'circle-opacity': ['case', ['boolean', ['feature-state', 'active'], false], 1, 0.6],
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#fff'
                    }
                });
            }
        }

        map.on('load', function () { addStoryLayers(); });
        map.on('style.load', function () { addStoryLayers(); });

        var layerList = ['Map', 'Satellite', 'Terrain', 'Streets', 'Light', 'Dark'];
        var mapTypeWrap = document.createElement('div');
        mapTypeWrap.className = 'map-type-control-wrap';
        mapTypeWrap.innerHTML = '<div class="map-type-control">' +
            '<button type="button" class="map-type-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="Map type">' +
            '<span class="map-type-label">Map</span><span class="map-type-chevron">▼</span>' +
            '</button>' +
            '<div class="map-type-menu" role="listbox" hidden>' +
            layerList.map(function (name) {
                return '<button type="button" class="map-type-option" role="option" data-name="' + escapeHtml(name) + '">' + escapeHtml(name) + '</button>';
            }).join('') +
            '</div></div>';
        var mapContainer = document.getElementById('map');
        if (mapContainer && mapContainer.parentNode) mapContainer.parentNode.appendChild(mapTypeWrap);

        var mapTypeBtn = mapTypeWrap.querySelector('.map-type-btn');
        var mapTypeLabel = mapTypeWrap.querySelector('.map-type-label');
        var mapTypeMenu = mapTypeWrap.querySelector('.map-type-menu');
        var mapTypeOptions = mapTypeWrap.querySelectorAll('.map-type-option');

        mapTypeBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            var isOpen = !mapTypeMenu.hidden;
            mapTypeMenu.hidden = isOpen;
            mapTypeBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
        });
        document.addEventListener('click', function (e) {
            if (!mapTypeMenu.hidden && !mapTypeWrap.contains(e.target)) {
                mapTypeMenu.hidden = true;
                mapTypeBtn.setAttribute('aria-expanded', 'false');
            }
        });

        mapTypeOptions.forEach(function (opt) {
            opt.addEventListener('click', function () {
                var name = this.getAttribute('data-name');
                var styleUrl = getStyleUrl(name);
                currentStyleName = name;
                mapTypeLabel.textContent = name;
                mapTypeMenu.hidden = true;
                mapTypeBtn.setAttribute('aria-expanded', 'false');
                mapTypeOptions.forEach(function (o) { o.classList.remove('selected'); });
                this.classList.add('selected');

                var finalStyle = styleUrl === 'raster-arcgis-satellite' ? arcgisSatellite : styleUrl;
                map.setStyle(finalStyle);
            });
        });
        mapTypeWrap.querySelector('.map-type-option[data-name="Map"]').classList.add('selected');

        var wrapper = byId('storyStepsWrapper');
        var activeIndex = -1;
        var currentPopup = null;

        function getWikimediaImageUrl(title, callback) {
            if (!title || !title.trim()) { callback(null); return; }
            var t = title.trim();
            var simple = t.replace(/\s*\([^)]*\)\s*$/, '').trim() || t;
            var apiUrl = 'https://en.wikipedia.org/w/api.php?origin=*&action=query&prop=pageimages&titles=' +
                encodeURIComponent(simple) + '&pithumbsize=800&format=json';
            fetch(apiUrl)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    var pages = data.query && data.query.pages;
                    if (!pages) { callback(null); return; }
                    var pageId = Object.keys(pages)[0];
                    if (pageId === '-1') { callback(null); return; }
                    var thumb = pages[pageId] && pages[pageId].thumbnail && pages[pageId].thumbnail.source;
                    callback(thumb || null);
                })
                .catch(function () { callback(null); });
        }

        // Cards on the right — each step has image + full card content
        storyData.forEach(function (step, index) {
            var placeKeyword = (step.place && step.place.split(',')[0]) ? step.place.split(',')[0].trim() : '';
            var div = document.createElement('section');
            div.className = 'story-step';
            div.dataset.index = index;
            div.dataset.placeKeyword = placeKeyword;
            div.innerHTML = '<div class="story-step-inner">' +
                '<img class="step-image" alt="' + escapeHtml(step.place) + '" loading="lazy" data-step-index="' + index + '">' +
                '<div class="year">' + step.year + '</div>' +
                '<div class="place">' + escapeHtml(step.place) + '</div>' +
                '<div class="text">' + escapeHtml(step.text) + '</div>' +
                (step.detail ? '<div class="detail">' + escapeHtml(step.detail) + '</div>' : '') +
                '</div>';
            div.addEventListener('click', function () {
                div.scrollIntoView({ behavior: 'smooth', block: 'center' });
                activateStep(index);
            });
            wrapper.appendChild(div);
        });

        var steps = wrapper.querySelectorAll('.story-step');

        var placeholderImg = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><rect fill="#e8e8e8" width="800" height="400"/><text fill="#999" x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="18">Image not available</text></svg>');

        steps.forEach(function (stepEl, index) {
            var placeKeyword = stepEl.dataset.placeKeyword || (storyData[index] && storyData[index].place);
            if (placeKeyword && placeKeyword.split) placeKeyword = placeKeyword.split(',')[0].trim();
            var img = stepEl.querySelector('.step-image');
            if (!img) return;
            if (!placeKeyword) { img.src = placeholderImg; return; }
            getWikimediaImageUrl(placeKeyword, function (url) {
                img.src = url || placeholderImg;
            });
        });

        function activateStep(index) {
            if (index < 0 || index >= storyData.length) return;
            activeIndex = index;

            steps.forEach(function (s, i) {
                s.classList.toggle('active', i === index);
            });

            var step = storyData[index];
            map.flyTo({ center: [step.lng, step.lat], zoom: step.zoom, duration: 2200 });

            try {
                storyData.forEach(function (_, i) {
                    map.setFeatureState({ source: 'story-points', id: i }, { active: i === index });
                });
            } catch (e) { /* source may not be ready yet */ }

            popup.remove();
            setTimeout(function () {
                popup.setLngLat([step.lng, step.lat])
                    .setHTML(
                        '<div class="popup-content">' +
                        '<div class="popup-year">' + step.year + '</div>' +
                        '<div class="popup-place">' + escapeHtml(step.place) + '</div>' +
                        '<div class="popup-text">' + escapeHtml(step.text) + '</div>' +
                        '</div>'
                    )
                    .addTo(map);
            }, 1600);
        }

        setTimeout(function () { activateStep(0); }, 500);

        // One scroll — active step = which card's vertical range contains viewport center
        function onScroll() {
            var viewportCenterY = window.innerHeight / 2;
            var found = -1;
            steps.forEach(function (step, index) {
                var rect = step.getBoundingClientRect();
                if (rect.top <= viewportCenterY && rect.bottom >= viewportCenterY) {
                    found = index;
                }
            });
            if (found < 0 && steps.length > 0) {
                var first = steps[0].getBoundingClientRect();
                var last = steps[steps.length - 1].getBoundingClientRect();
                if (viewportCenterY < first.top) found = 0;
                else if (viewportCenterY > last.bottom) found = steps.length - 1;
            }
            if (found >= 0 && found !== activeIndex) activateStep(found);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    function run() {
        fillFromConfig();
        initMapAndStory();
    }

    var STORAGE_KEY = 'storyTellingGeneratedConfig';

    function expandStoryConfig(compact) {
        if (!compact || !compact.S || !Array.isArray(compact.S)) return null;
        return {
            meta: { title: compact.T || 'Story' },
            header: { logo: compact.L || 'The Geographic Story' },
            hero: { label: compact.Hl || '', title: compact.Ht || '', subtitle: compact.Hs || '', author: compact.Ha || '', date: compact.Hd || '' },
            articleIntro: { lead: compact.Al || '', dropCap: compact.Ad || '', dropCapHighlight: compact.Ah || '', paragraph: compact.Ap || '' },
            dataSection: { title: compact.Dt || '', cards: compact.Dc || [] },
            mapSection: { intro: compact.Mi || '' },
            articleReturn: { title: compact.Rt || '', paragraphs: compact.Rp || [] },
            timeline: { title: compact.Ct || '', items: compact.Ci || [] },
            footer: { lines: compact.Fl || [] },
            storyData: compact.S.map(function (item) {
                return { year: item.y, place: item.p || '', lat: item.a, lng: item.n, zoom: item.z, text: item.x || '', detail: item.D || '' };
            })
        };
    }

    function getConfigFromHash() {
        var hash = window.location.hash || '';
        var m = hash.match(/^#story=(.+)$/);
        if (!m) return null;
        try {
            var decoded = null;
            if (typeof LZString !== 'undefined' && LZString.decompressFromEncodedURIComponent) {
                decoded = LZString.decompressFromEncodedURIComponent(m[1]);
            }
            if (!decoded) decoded = decodeURIComponent(m[1]);
            if (!decoded) return null;
            var parsed = JSON.parse(decoded);
            if (parsed.S && Array.isArray(parsed.S)) return expandStoryConfig(parsed);
            return parsed;
        } catch (e) {
            return null;
        }
    }

    function minifyStoryConfig(config) {
        if (!config || !config.storyData || !config.storyData.length) return null;
        return {
            T: config.meta && config.meta.title,
            L: config.header && config.header.logo,
            Hl: config.hero && config.hero.label, Ht: config.hero && config.hero.title, Hs: config.hero && config.hero.subtitle, Ha: config.hero && config.hero.author, Hd: config.hero && config.hero.date,
            Al: config.articleIntro && config.articleIntro.lead, Ad: config.articleIntro && config.articleIntro.dropCap, Ah: config.articleIntro && config.articleIntro.dropCapHighlight, Ap: config.articleIntro && config.articleIntro.paragraph,
            Dt: config.dataSection && config.dataSection.title, Dc: config.dataSection && config.dataSection.cards,
            Mi: config.mapSection && config.mapSection.intro,
            Rt: config.articleReturn && config.articleReturn.title, Rp: config.articleReturn && config.articleReturn.paragraphs,
            Ct: config.timeline && config.timeline.title, Ci: config.timeline && config.timeline.items,
            Fl: config.footer && config.footer.lines,
            S: config.storyData.map(function (item) { return { y: item.year, p: item.place, a: item.lat, n: item.lng, z: item.zoom, x: item.text, D: item.detail }; })
        };
    }

    function setStoryHash(config) {
        try {
            var compact = minifyStoryConfig(config);
            var encoded = typeof LZString !== 'undefined' && LZString.compressToEncodedURIComponent && compact
                ? LZString.compressToEncodedURIComponent(JSON.stringify(compact))
                : (typeof LZString !== 'undefined' && LZString.compressToEncodedURIComponent ? LZString.compressToEncodedURIComponent(JSON.stringify(config)) : encodeURIComponent(JSON.stringify(config)));
            var url = window.location.pathname + (window.location.search || '') + '#story=' + encoded;
            window.history.replaceState(null, '', url);
        } catch (e) { /* ignore */ }
    }

    function getStoryId() {
        var params = new URLSearchParams(window.location.search);
        var id = params.get('story') || 'gandhi';
        var valid = ['gandhi', 'elon-musk', 'swami-vivekananda', 'albert-einstein', 'nelson-mandela', 'mother-teresa', 'narendra-modi'];
        return valid.indexOf(id) >= 0 ? id : 'gandhi';
    }

    function getConfigUrl(storyId) {
        return storyId === 'gandhi' ? 'config.json' : 'configs/' + storyId + '.json';
    }

    function isGeneratedMode() {
        var params = new URLSearchParams(window.location.search);
        return params.get('generated') === '1';
    }

    function showShareAction() {
        var actions = document.getElementById('headerActions');
        if (!actions || !config) return;
        actions.style.display = 'flex';
        actions.style.justifyContent = 'flex-end';
        actions.innerHTML = '<button type="button" id="copyLinkBtn">Copy link</button>';
        document.getElementById('copyLinkBtn').addEventListener('click', function () {
            try {
                navigator.clipboard.writeText(window.location.href);
                var btn = document.getElementById('copyLinkBtn');
                if (btn) { btn.textContent = 'Copied!'; setTimeout(function () { btn.textContent = 'Copy link'; }, 2000); }
            } catch (e) {
                alert('Copy failed. Bookmark this page or copy the URL from the address bar.');
            }
        });
    }

    function loadConfig() {
        var fromHash = getConfigFromHash();
        if (fromHash && fromHash.storyData && fromHash.storyData.length > 0) {
            config = fromHash;
            run();
            showShareAction();
            return;
        }

        if (isGeneratedMode()) {
            try {
                var stored = sessionStorage.getItem(STORAGE_KEY);
                if (stored) {
                    config = JSON.parse(stored);
                    run();
                    setStoryHash(config);
                    showShareAction();
                    return;
                }
            } catch (e) {
                console.error(e);
            }
            document.body.insertAdjacentHTML('beforeend', '<p style="padding: 20px; color: #c41e3a;">No generated story found. <a href="index.html">Create one from the home page</a>.</p>');
            return;
        }

        var storyId = getStoryId();
        var configUrl = getConfigUrl(storyId);

        return fetch(configUrl)
            .then(function (res) {
                if (!res.ok) throw new Error('Failed to load config: ' + res.status);
                return res.json();
            })
            .then(function (data) {
                config = data;
                run();
            })
            .catch(function (err) {
                console.error(err);
                document.body.insertAdjacentHTML('beforeend', '<p style="padding: 20px; color: #c41e3a;">Failed to load config. Check the console.</p>');
            });
    }

    var loadPromise = loadConfig();
    if (loadPromise && typeof loadPromise.catch === 'function') loadPromise.catch(function (err) { console.error(err); });
})();

