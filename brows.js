body = document.querySelector('body');
is_classic = body.getAttribute('data-static-path').includes('classic');

if(is_classic)
{

complete_form_keys = ['cat','atype','species','gender', 
'rating_general', 'rating_mature', 'rating_adult'
]

rating_keys = [
'rating_general', 'rating_mature', 'rating_adult'
]

var form_config_lookup = {};

form = document.querySelector("form[name='replyform']")
fa_update = form.querySelector('input[name="go"]')

//////////////
// add hwm ui

// current hwm label
form_title = form.querySelector('font')
current_value = document.querySelector('#_fafix_current_hwm')
if (current_value == null){
    current_value = document.createElement('span')
    current_value.id = '_fafix_current_hwm'
    form_title.after(current_value)
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
    pkey = form_config_lookup[key]['pkey']

    for (name of rating_keys) {
        this_one = `[name='${name}']`
        console.log(this_one)
        field = form.querySelector(`[name='${name}']`)
        if (field != null){
            field.checked=false
            }
        }


    for (name in pkey) {
        value = pkey[name]
        this_one = `[name='${name}']`
        console.log(this_one)
        field = form.querySelector(`[name='${name}']`)
        if (field != null){
            if(field.type == "checkbox") {field.checked=true}
            else {field.value = value}
            }
        }

    }


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
    console.log("get ur bunp on")
    all_of_them = document.querySelectorAll('figure')
    sid = parseInt(all_of_them[0].id.substring(4))

    form_data = new FormData(form)

    complete_form_config = ''
    for(key of complete_form_keys) {
        complete_form_config += '|'+key+':'+form_data.get(key)
        }
    console.log(complete_form_config)

    var form_json = {};
    form_data.forEach(function(value, key){
            form_json[key] = value;
        });

    display_name = get_display_name(form_json)

    form_object = {
        sid: sid,
        form_data: form_json,
        display_name: `${_type}|${_species}`
        }
    console.log(form_object)

    browser.storage.local.set({[complete_form_config]:form_object})
    console.log('did the thing')
    mark_target(sid)
    }


/////////////////
// functionality

form_data = new FormData(form)

complete_form_config = ''
for(key of complete_form_keys) {
    complete_form_config += '|'+key+':'+form_data.get(key)
    }
console.log(complete_form_config)

//retrieve configs and populate selections

getting_item = browser.storage.local.get()
getting_item.then(onGot, onError)

function onGot(item) {
    console.log(item);

    all_of_them = document.querySelectorAll('figure')
    sid = parseInt(all_of_them[0].id.substring(4))

    new_value = document.querySelector('#_fafix_new_hwm')
    new_value.innerHTML = `${sid}`

    menu_items = []

    for (key in item) {
        if(typeof(item[key]) == "object") {
            display_name = get_display_name(item[key]['form_data'])
            menu_items.push({
                form_key: key,
                key: display_name,
                pkey: item[key]['form_data'],
                hwm: item[key]['sid'],
                })
            }
        }

    menu_items.sort((a,b) => a.hwm-b.hwm)
    selector.innerHTML = ''
    for (entry of menu_items) {
        option = document.createElement('option')
        key = entry['key']
        form_config_lookup[entry['form_key']] = entry    
        option.innerHTML = `${key} ${entry['hwm']}`
        option.value = entry['form_key']
        selector.add(option)
        }

    console.log(menu_items)

    target = item[complete_form_config]
    if (target != null){
        if(typeof(target) == 'object'){
            target = target['sid']
            }
        selector.value = complete_form_config
        mark_target(target)
        }
    }

function onError(error) {
    console.log(`Error: ${error}`);
    }



function mark_target(target){
    submit = document.querySelector("input[name='go']")

    current_value = document.querySelector('#_fafix_current_hwm')
    if (current_value == null){
        current_value = document.createElement('span')
        current_value.id = '_fafix_current_hwm'
        submit.after(current_value)
    }

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

    gallery = document.querySelector('#gallery-browse')
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

function get_display_name(form_data) {
    display_name = ''
    field = form.querySelector(`[name='atype']`)
    value = form_data['atype']
    if (value != '1') {
        option = field.querySelector(`option[value='${value}']`)
        _type = option.innerText
        display_name += _type
        }

    field = form.querySelector(`[name='species']`)
    value = form_data['species']
    option = field.querySelector(`option[value='${value}']`)
    _species = option.innerText
    if (value != '1')
    {
        if(display_name != '') {display_name += ' | '}
        display_name += _species
    }

    if(form_data['rating_general']){ display_name += ' X'}
    else {display_name +=' _' }
    if(form_data['rating_mature']){ display_name += 'X'}
    else {display_name +='_' }
    if(form_data['rating_adult']){ display_name += 'X'}
    else {display_name +='_' }

    if (display_name == '') { display_name = 'No Filter'}
    return display_name
    }




}

