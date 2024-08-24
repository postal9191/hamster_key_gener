const gameConfigs = {
    bike: {
        APP_TOKEN: 'd28721be-fd2d-4b45-869e-9f253b554e50',
        PROMO_ID: '43e35910-c168-4634-ad4f-52fd764a843f',
        EVENTS_DELAY: 22000
    },
    chainCub: {
        APP_TOKEN: 'd1690a07-3780-4068-810f-9b5bbf2931b2',
        PROMO_ID: 'b4170868-cef0-424f-8eb9-be0622e8e8e3',
        EVENTS_DELAY: 22000
    },
    cloneArmy: {
        APP_TOKEN: '74ee0b5b-775e-4bee-974f-63e7f4d5bacb',
        PROMO_ID: 'fe693b26-b342-4159-8808-15e3ff7f8767',
        EVENTS_DELAY: 120000
    },
    trainMiner: {
        APP_TOKEN: '82647f43-3f87-402d-88dd-09a90025313f',
        PROMO_ID: 'c4480ac7-e178-4973-8061-9ed5b2e17954',
        EVENTS_DELAY: 120000
    },
    mergeAway: {
        APP_TOKEN: '8d1cc2ad-e097-4b86-90ef-7a27e19fb833',
        PROMO_ID: 'dc128d28-c45b-411c-98ff-ac7726fbaea4',
        EVENTS_DELAY: 22000
    },
    twerkRace: {
        APP_TOKEN: '61308365-9d16-4040-8bb0-2f4a4c69074c',
        PROMO_ID: '61308365-9d16-4040-8bb0-2f4a4c69074c',
        EVENTS_DELAY: 20000
    },
    polysphere: {
        APP_TOKEN: '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71',
        PROMO_ID: '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71',
        EVENTS_DELAY: 3000
    },
    mow_and_Trim: {
        APP_TOKEN: 'ef319a80-949a-492e-8ee0-424fb5fc20a6',
        PROMO_ID: 'ef319a80-949a-492e-8ee0-424fb5fc20a6',
        EVENTS_DELAY: 31000
    },
    mud_Racing: {
        APP_TOKEN: '8814a785-97fb-4177-9193-ca4180ff9da8',
        PROMO_ID: '8814a785-97fb-4177-9193-ca4180ff9da8',
        EVENTS_DELAY: 31000
    }
};

document.getElementById('startBtn').addEventListener('click', async () => {
    const selectedGame = document.getElementById('gameSelect').value;
    const { APP_TOKEN, PROMO_ID, EVENTS_DELAY } = gameConfigs[selectedGame];

    const startBtn = document.getElementById('startBtn');
    const keyCountSelect = document.getElementById('keyCountSelect');
    const keyCountLabel = document.getElementById('keyCountLabel');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const keyContainer = document.getElementById('keyContainer');
    const keysList = document.getElementById('keysList');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const generatedKeysTitle = document.getElementById('generatedKeysTitle');
    const copyStatus = document.getElementById('copyStatus');
    const keyCount = parseInt(keyCountSelect.value);

    keyCountLabel.innerText = `Number of Keys: ${keyCount}`;

    progressBar.style.width = '0%';
    progressText.innerText = '0%';
    progressContainer.classList.remove('hidden');
    keyContainer.classList.add('hidden');
    generatedKeysTitle.classList.add('hidden');
    keysList.innerHTML = '';
    keyCountSelect.classList.add('hidden');
    startBtn.classList.add('hidden');
    copyAllBtn.classList.add('hidden');
    startBtn.disabled = true;

    let progress = 0;
    const updateProgress = (increment) => {
        progress += increment;
        progressBar.style.width = `${progress}%`;
        progressText.innerText = `${progress}%`;
    };

    const generateKeyProcess = async () => {
        const clientId = generateClientId();
        let clientToken;
        try {
            clientToken = await login(clientId, APP_TOKEN);
        } catch (error) {
            alert(`Не удалось войти: ${error.message}`);
            startBtn.disabled = false;
            return null;
        }

        for (let i = 0; i < 16; i++) {
            await sleep(EVENTS_DELAY * delayRandom());
            const hasCode = await emulateProgress(clientToken, PROMO_ID);
            updateProgress(9 / keyCount);
            if (hasCode) {
                break;
            }
        }

        try {
            const key = await generateKey(clientToken, PROMO_ID);
            updateProgress(10);
            return key;
        } catch (error) {
            alert(`Failed to generate key: ${error.message}`);
            return null;
        }
    };

    const keys = await Promise.all(Array.from({ length: keyCount }, generateKeyProcess));

    if (keys.length > 1) {
        keysList.innerHTML = keys.filter(key => key).map(key => 
            `<div class="key-item">
                <input type="text" value="${key}" readonly>
                <button class="copyKeyBtn" data-key="${key}">Copy key</button>
            </div>`
        ).join('');
        copyAllBtn.classList.remove('hidden');
    } else if (keys.length === 1) {
        keysList.innerHTML = 
            `<div class="key-item">
                <input type="text" value="${keys[0]}" readonly>
                <button class="copyKeyBtn" data-key="${keys[0]}">Copy key</button>
            </div>`;
    }

    keyContainer.classList.remove('hidden');
    generatedKeysTitle.classList.remove('hidden');
    document.querySelectorAll('.copyKeyBtn').forEach(button => {
        button.addEventListener('click', (event) => {
            const key = event.target.getAttribute('data-key');
            navigator.clipboard.writeText(key).then(() => {
                copyStatus.classList.remove('hidden');
                setTimeout(() => copyStatus.classList.add('hidden'), 2000);
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        });
    });
    copyAllBtn.addEventListener('click', () => {
        const keysText = keys.filter(key => key).join('\n');
        navigator.clipboard.writeText(keysText).then(() => {
            copyStatus.classList.remove('hidden');
            setTimeout(() => copyStatus.classList.add('hidden'), 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    });

    updateProgress(100);

    startBtn.classList.remove('hidden');
    keyCountSelect.classList.remove('hidden');
    startBtn.disabled = false;
});

document.getElementById('generateMoreBtn').addEventListener('click', () => {
    document.getElementById('progressContainer').classList.add('hidden');
    document.getElementById('keyContainer').classList.add('hidden');
    document.getElementById('startBtn').classList.remove('hidden');
    document.getElementById('keyCountSelect').classList.remove('hidden');
    document.getElementById('generatedKeysTitle').classList.add('hidden');
    document.getElementById('copyAllBtn').classList.add('hidden');
    document.getElementById('keysList').innerHTML = '';
    document.getElementById('keyCountLabel').innerText = 'Number of keys:';
});

document.getElementById('creatorChannelBtn').addEventListener('click', () => {
    alert('Братуха нет у меня канала пользуйся с удовольствием');
});

function generateClientId() {
    const timestamp = Date.now();
    const randomNumbers = Array.from({ length: 19 }, () => Math.floor(Math.random() * 10)).join('');
    return `${timestamp}-${randomNumbers}`;
}

async function login(clientId, appToken) {
    const response = await fetch('https://api.gamepromo.io/promo/login-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appToken, clientId, clientOrigin: 'deviceid' })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
    }
    return data.clientToken;
}

async function emulateProgress(clientToken, promoId) {
    const response = await fetch('https://api.gamepromo.io/promo/register-event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${clientToken}`
        },
        body: JSON.stringify({
            promoId,
            eventId: crypto.randomUUID(),
            eventOrigin: 'undefined'
        })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to register event');
    }
    return data.hasCode;
}

async function generateKey(clientToken, promoId) {
    const response = await fetch('https://api.gamepromo.io/promo/create-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${clientToken}`
        },
        body: JSON.stringify({ promoId })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Failed to generate key');
    }
    return data.promoCode;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function delayRandom() {
    return Math.random() / 3 + 1;
}
