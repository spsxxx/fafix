body = document.querySelector('body');
is_classic = body.getAttribute('data-static-path').includes('classic');

if(is_classic)
{

form = document.querySelector("form[id='search-form']")
fa_update = form.querySelector('input[value="Disable Titles"]')

url_config_lookup = {}
current_url = null

//////////////
// add hwm ui

// current hwm label
form_title = document.querySelector('.cat')
current_value = document.querySelector('#_fafix_current_hwm')
if (current_value == null){
    current_value = document.createElement('span')
    current_value.id = '_fafix_current_hwm'
    form_title.append(current_value)
    }
current_value.style.margin='3px'

// this page's hwm label

new_value = document.querySelector('#_fafix_new_hwm')
if (new_value == null){
    new_value = document.createElement('span')
    new_value.id = '_fafix_new_hwm'
    current_value.after(new_value)
    }
new_value.style.margin='3px'

// selector
selector = document.querySelector('#_fafix_select_query')
if (selector == null){
    selector = document.createElement('select')
    selector.id = '_fafix_select_query'
    fa_update.after(selector)
    selector.addEventListener('change', change_query)
    }
selector.className = 'listbox'

function change_query(){
    console.log(selector.value)
    key = selector.value

    //TODO goto url

    target_url = url_config_lookup[key]['pkey']
    if(target_url == current_url){ return;}
    parts = target_url.split('?')
    base_url = parts[0]
    qs = parts[1]
    params = new URLSearchParams(qs)
    params.set('page', '1')
    window.location.href = base_url + '?' + params.toString()



    }

// update button
update_query = document.querySelector('#_fafix_update_query')
if (update_query == null){
    update_query = document.createElement('input')
    update_query.id='_fafix_update_query'
    fa_update.after(update_query)
    update_query.addEventListener("click", change_query)
    }
update_query.value = 'update'
update_query.type = 'button'
update_query.className = 'button active'
fa_update = update_query

// goto button
goto_hwm = document.querySelector('#_fafix_goto_hwm')
if (goto_hwm == null){
    goto_hwm = document.createElement('input')
    goto_hwm.id='_fafix_goto_hwm'
    fa_update.before(goto_hwm)
    goto_hwm.addEventListener("click", my_goto_hwm)
    }
goto_hwm.value = 'junp'
goto_hwm.type = 'button'
goto_hwm.className = 'button active'
//goto_hwm.style.paddingTop = '2px'
//goto_hwm.style.marginTop = '0px'

function my_goto_hwm(){
    if(goto_hwm.value == 'junp'){
    console.log('go to hwm')
        indicator = document.querySelector('#_fafix_hwm_indicator')
        if(indicator != null){
            window.scrollTo(0, indicator.offsetTop);
            }
        }
    else if (goto_hwm.value == 'next') {
    console.log('go to next page then')
        goto_next_page()
        }
    else if (goto_hwm.value == 'prev') {
    console.log('go to prev page then')
        goto_prev_page()
        }
    }

function goto_next_page(){
    button = document.querySelector("button[class='button right']")
    if(button.innerHTML == 'Next'){
        button.click();
        }
    }

function goto_prev_page(){
    button = document.querySelector("button[class='button left']")
    if(button.innerHTML == 'Back'){
        button.click();
        }
    }

// bunp button

update_hwm = document.querySelector('#_fafix_update_hwm')
if (update_hwm == null){
    update_hwm = document.createElement('input')
    update_hwm.id='_fafix_update_hwm'
    selector.after(update_hwm)
    update_hwm.addEventListener("click", my_update_hwm)
    }
update_hwm.value = 'bunp'
update_hwm.type = 'button'
update_hwm.className = 'button active'
//update_hwm.style.float='right'

function my_update_hwm(){
    all_of_them = document.querySelectorAll('figure')
    sid = parseInt(all_of_them[0].id.substring(4))

    display_name = get_display_name(current_url)

    form_object = {
        sid: sid,
        kind: 'fa_search',
        url: current_url,
        display_name: display_name
        }
    console.log(form_object)

    browser.storage.local.set({[current_url]:form_object})
    mark_target(sid)
    }


function get_display_name(url){
    qs = url.split('?')[1]
    params = new URLSearchParams(qs)
    query = params.get('q')
    return query
    }

/////////////////
// functionality

//retrieve configs and populate selections

function onGot(item) {
    console.log(item);
    console.log(current_url)

    all_of_them = document.querySelectorAll('figure')
    sid = parseInt(all_of_them[0].id.substring(4))

    new_value = document.querySelector('#_fafix_new_hwm')
    new_value.innerHTML = `${sid}`

    menu_items = []

    for (key in item) {
        if(typeof(item[key]) == "object" && item[key]['kind'] == 'fa_search') {
            display_name = get_display_name(item[key]['url'])
            menu_items.push({
                form_key: key,
                key: display_name,
                pkey: item[key]['url'],
                hwm: item[key]['sid'],
                })
            }
        }

    menu_items.sort((a,b) => a.hwm-b.hwm)
    selector.innerHTML = ''
    for (entry of menu_items) {
        option = document.createElement('option')
        key = entry['key']
        url_config_lookup[entry['pkey']] = entry
        console.log('saving '+ entry['pkey'])
        option.innerHTML = `${key} ${entry['hwm']}`
        option.value = entry['form_key']
        selector.add(option)
        }

    console.log(menu_items)

    target = item[current_url]
    if (target != null){
        if(typeof(target) == 'object'){
            target = target['sid']
            }
        selector.value = current_url
        mark_target(target)
        }
    else {
        mark_target(null)
        selector.value = null
        }
    }

function onError(error) {
    console.log(`Error: ${error}`);
    }

current_url = window.location.href
parts = current_url.split('?')
base_url = parts[0]
qs = parts[1]
params = new URLSearchParams(qs)
params.set('page', '1')
current_url = base_url + '?' + params.toString()

getting_item = browser.storage.local.get()
getting_item.then(onGot, onError)


function mark_target(target){
    submit = document.querySelector("input[name='go']")

    current_value = document.querySelector('#_fafix_current_hwm')
    current_value.innerHTML = target

    last_sid = 0
    all_of_them = document.querySelectorAll('figure')

    goto_hwm = document.querySelector('#_fafix_goto_hwm')
    goto_hwm.className = 'button inactive'
    indicator = null

    before_map = {}
    after_map = {}
    for(var idx in all_of_them) {
        entry = all_of_them[idx]
        //console.log(entry)
        if (entry.id == null) {continue}

        info = parse_figure(entry)
        artist_name = info['artist'].title
        if (artist_name == 'bernardol22'){
            continue
            }
        if(info.sid > target ) {
            entry_map = before_map
            }
        else {
            entry_map = after_map
            }
        if(!entry_map[artist_name]){
            entry_map[artist_name] = []
            }
        entry_map[artist_name].push(entry)

        }

    gallery = document.querySelector('#gallery-search-results')
    gallery.innerHTML = ''    

    for (artist_name in before_map){
        wrapper = document.createElement('div')
        wrapper.className = 'subgroup'
        gallery.append(wrapper)
        for(entry of before_map[artist_name]){
            wrapper.append(entry)
            }
        }

    first = true
    for (artist_name in after_map){
        wrapper = document.createElement('div')
        wrapper.className = 'subgroup'
        if(first) {
            first = false
            indicator = wrapper
            indicator.id = '_fafix_hwm_indicator'
            indicator.className += ' indy'
            }
        gallery.append(wrapper)
        for(entry of after_map[artist_name]){
            wrapper.append(entry)
            }
        }

    if(Object.keys(after_map).length == 0) {
        goto_hwm.value = 'next'
        }
    else if (Object.keys(before_map).length == 0){
        goto_hwm.value = 'prev'
        }
    else {
        goto_hwm.className = 'button active'
        goto_hwm.value = 'junp'
        }


    }



}
