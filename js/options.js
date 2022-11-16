function save_options() {
    const history_enable = document.getElementById('history_enable').checked;
    const history_number_list = document.getElementById('history_number_list').checked;
    const history_date_list = document.getElementById('history_date_list').checked;
    const history_title = document.getElementById('history_title').checked;
    const history_reverse_list = document.getElementById('history_reverse_list').checked;
    const history_length = Math.abs(parseInt(document.getElementById('history_length').value));

    chrome.storage.sync.set({
            history_enable: history_enable,
            history_length: history_length,
            history_number_list: history_number_list,
            history_date_list: history_date_list,
            history_title: history_title,
            history_reverse_list: history_reverse_list
        }
    );

    let history_queue;
    chrome.storage.sync.get({
        history_queue: [],
    }, function(items) {
            history_queue = items.history_queue
            while (history_queue.length > history_length) {
                history_queue.shift();
            }
            chrome.storage.sync.set({
                history_queue: history_queue
            }, function() {
                    let status = document.getElementById('status');
                    status.textContent = 'Options saved.';
                    setTimeout(function() {
                    status.textContent = '';
                    }, 750);
                    restore_options();
               }
            );
        }
    );
}

function restore_options() {
    chrome.storage.sync.get({
        history_enable: true,
        history_length: 100,
        history_queue: [],
        history_number_list: true,
        history_date_list: true,
        history_title: true,
        history_reverse_list: true  
    }, function(items) {
        document.getElementById('history_length').value = items.history_length;
        document.getElementById('history_enable').checked = items.history_enable;
        document.getElementById('history_number_list').checked = items.history_number_list;
        document.getElementById('history_date_list').checked = items.history_date_list;
        document.getElementById('history_title').checked = items.history_title;
        document.getElementById('history_reverse_list').checked = items.history_reverse_list;
        let list = items.history_queue.map((link, index)=>{
            let str_arr = [];
            str_arr.push('<div>');
            if(items.history_number_list) str_arr.push(`${index + 1}:`);
            if(items.history_date_list) str_arr.push(link.date);
            str_arr.push(`<a target="_blank" href="${link.url}">${link.url}</a>`);
            if(items.history_title) str_arr.push(`${link.title}`);
            str_arr.push('</div>');
            return str_arr.join(' ');
        })
        if(items.history_reverse_list) {
            list = list.reverse()
        }
        document.getElementById('history').innerHTML = list.join('');
    });
}

function clear_history() {
    chrome.storage.sync.set({
        history_queue: []
    }, function() {
        document.getElementById('history').innerHTML = '';
        let status = document.getElementById('status');
        status.textContent = 'History cleared.';
        setTimeout(function() {
          status.textContent = '';
        }, 900);
    })
    
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('clear').addEventListener('click', clear_history);
chrome.tabs.onActivated.addListener(restore_options);