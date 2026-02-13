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

        var storyData = config.storyData;
        var first = storyData[0];
        var map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        }).setView([first.lat, first.lng], first.zoom);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);

        var markers = storyData.map(function (s) {
            return L.circleMarker([s.lat, s.lng], {
                radius: 7,
                fillColor: '#c41e3a',
                fillOpacity: 0.7,
                color: '#fff',
                weight: 2
            }).addTo(map);
        });

        var wrapper = byId('storyStepsWrapper');
        var activeIndex = -1;
        var currentPopup = null;

        // Cards on the right — each step has full card content
        storyData.forEach(function (step, index) {
            var div = document.createElement('section');
            div.className = 'story-step';
            div.dataset.index = index;
            div.innerHTML = '<div class="story-step-inner">' +
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

        function activateStep(index) {
            if (index < 0 || index >= storyData.length) return;
            activeIndex = index;

            steps.forEach(function (s, i) {
                s.classList.toggle('active', i === index);
            });

            var step = storyData[index];
            map.flyTo([step.lat, step.lng], step.zoom, { duration: 2.2, easeLinearity: 0.35 });

            markers.forEach(function (m, i) {
                m.setStyle({
                    radius: i === index ? 12 : 7,
                    fillOpacity: i === index ? 1 : 0.5
                });
            });

            if (currentPopup) map.closePopup(currentPopup);

            setTimeout(function () {
                currentPopup = L.popup({ closeButton: false, offset: [0, -12] })
                    .setLatLng([step.lat, step.lng])
                    .setContent(
                        '<div class="popup-content">' +
                        '<div class="popup-year">' + step.year + '</div>' +
                        '<div class="popup-place">' + escapeHtml(step.place) + '</div>' +
                        '<div class="popup-text">' + escapeHtml(step.text) + '</div>' +
                        '</div>'
                    )
                    .openOn(map);
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
            return JSON.parse(decoded);
        } catch (e) {
            return null;
        }
    }

    function setStoryHash(config) {
        try {
            var encoded = typeof LZString !== 'undefined' && LZString.compressToEncodedURIComponent
                ? LZString.compressToEncodedURIComponent(JSON.stringify(config))
                : encodeURIComponent(JSON.stringify(config));
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

        fetch(configUrl)
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

    loadConfig().catch(function (err) { console.error(err); });
})();

