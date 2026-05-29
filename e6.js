console.log('e6 activated')

sidebar = document.querySelector('div.sidebar')

my_section = document.querySelector('#_fafix_section')
if (my_section == null) {
    my_section = document.createElement('section')
    my_section.id = '_fafix_section'
    sidebar.prepend(my_section)
    }

url_config_lookup = {}
current_url = null

//////////////
// add hwm ui

// goto button
goto_hwm = document.querySelector('#_fafix_goto_hwm')
if (goto_hwm == null){
    goto_hwm = document.createElement('input')
    goto_hwm.id='_fafix_goto_hwm'
    my_section.append(goto_hwm)
    my_section.append(document.createElement('br'))
    goto_hwm.addEventListener("click", my_goto_hwm)
    }
goto_hwm.className = 'e6ui'
goto_hwm.value = 'junp'
goto_hwm.type = 'button'
//goto_hwm.className = 'button active'
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
    button = document.querySelector("#paginator-next")
    button.click();
    }

function goto_prev_page(){
    button = document.querySelector("#paginator-prev")
    button.click();
    }



// selector
selector = document.querySelector('#_fafix_select_query')
if (selector == null){
    selector = document.createElement('select')
    selector.id = '_fafix_select_query'
    my_section.append(selector)
    my_section.append(document.createElement('br'))
    selector.addEventListener('change', change_query)
    }
//selector.className = 'listbox'
selector.className = 'e6ui'

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
    params.delete('page')
    window.location.href = base_url + '?' + params.toString()



    }

// current hwm label
current_value = document.querySelector('#_fafix_current_hwm')
if (current_value == null){
    current_value = document.createElement('span')
    current_value.id = '_fafix_current_hwm'
    my_section.append(current_value)
//    my_section.append(document.createElement('br'))
    }
current_value.style.margin='3px'

// this page's hwm label

new_value = document.querySelector('#_fafix_new_hwm')
if (new_value == null){
    new_value = document.createElement('span')
    new_value.id = '_fafix_new_hwm'
    my_section.append(new_value)
    my_section.append(document.createElement('br'))
    }
new_value.style.margin='3px'


// update button
/*
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
*/

// bunp button

update_hwm = document.querySelector('#_fafix_update_hwm')
if (update_hwm == null){
    update_hwm = document.createElement('input')
    update_hwm.id='_fafix_update_hwm'
    my_section.append(update_hwm)
    my_section.append(document.createElement('br'))
    update_hwm.addEventListener("click", my_update_hwm)
    }
update_hwm.value = 'bunp'
update_hwm.type = 'button'
update_hwm.className = 'e6ui'
//update_hwm.className = 'button active'
//update_hwm.style.float='right'

function my_update_hwm(){
    sid = get_current_hwm()

    display_name = get_display_name(current_url)

    form_object = {
        sid: sid,
        kind: 'e6_search',
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
    query = params.get('tags')
    return query
    }

/////////////////
// functionality

//retrieve configs and populate selections


function get_current_hwm(){
    all_of_them = document.querySelectorAll('article')
    result = 0
    for (entry of all_of_them){
        result = Math.max(result, parseInt(entry.getAttribute('data-id')))
        } 
    return result
}

function parse_article(article){
    result = {}

    result['sid'] = parseInt(article.getAttribute('data-id'))

    //unknowable
    result['artist'] = null

    return result
    }


function onGot(item) {
    console.log(item);
    console.log(current_url)

    sid = get_current_hwm()

    new_value = document.querySelector('#_fafix_new_hwm')
    new_value.innerHTML = `${sid}`

    menu_items = []

    for (key in item) {
        if(typeof(item[key]) == "object" && item[key]['kind'] == 'e6_search') {
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
params.delete('page')
current_url = base_url + '?' + params.toString()

getting_item = browser.storage.local.get()
getting_item.then(onGot, onError)


function mark_target(target){

    current_value = document.querySelector('#_fafix_current_hwm')
    current_value.innerHTML = target

    last_sid = 0
    all_of_them = document.querySelectorAll('article')

    goto_hwm = document.querySelector('#_fafix_goto_hwm')
//    goto_hwm.className = 'button inactive'
    indicator = null

    before_map = {}
    after_map = {}
    for(var idx in all_of_them) {
        entry = all_of_them[idx]
        //console.log(entry)
        if (entry.id == null) {continue}

        info = parse_article(entry)
        artist_name = info.artist_name
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

    gallery = document.querySelector('section.posts-container')
    gallery.innerHTML = ''    

    for (artist_name in before_map){
//        wrapper = document.createElement('div')
//        wrapper.className = 'subgroup'
//        gallery.append(wrapper)
        for(entry of before_map[artist_name]){
            gallery.append(entry)
            }
        }

    first = true
    for (artist_name in after_map){
        for(entry of after_map[artist_name]){
           if(first) {
                console.log('first')
                first = false
                indicator = entry
                entry.id = '_fafix_hwm_indicator'
                entry.style.border = '7px solid #105b21'
//                indicator.className += ' indy'
//                wrapper.append(entry)
  //              entry = wrapper
                }
     
            gallery.append(entry)
            }
        }

    if(Object.keys(after_map).length == 0) {
        goto_hwm.value = 'next'
        }
    else if (Object.keys(before_map).length == 0){
        goto_hwm.value = 'prev'
        }
    else {
        goto_hwm.value = 'junp'
        }


    }

