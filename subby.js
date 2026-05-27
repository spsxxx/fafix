body = document.querySelector('body');
is_classic = body.getAttribute('data-static-path').includes('classic');

if(is_classic)
{

function get_items(){
	all_of_them = document.querySelectorAll('figure')


	entry_map = {}
	for(var idx in all_of_them) {
		entry = all_of_them[idx]
		//console.log(entry)
		if (entry.id == null) {continue}

		info = parse_figure(entry)
		artist_name = info['artist'].title
		if(!entry_map[artist_name]){
			entry_map[artist_name] = []
			}
		entry_map[artist_name].push(entry)

		}

	gallery = document.querySelector('.notification-galleries')
	gallery.innerHTML = ''	

	div = document.createElement('div')
	div.className = 'notifications-by-date'
	contents = `<h3 class="date-divider">good morning</h3>
	<section id="gallery-0" class="gallery messagecenter with-checkboxes s-200 ">
	</section>
`
	div.innerHTML = contents;
	section = div.querySelector('section')
	gallery.append(div)

	for (artist_name in entry_map){
		wrapper = document.createElement('div')
		wrapper.className = 'subgroup'
		section.append(wrapper)
		for(entry of entry_map[artist_name]){
			
			wrapper.append(entry)
			}
		
	
		}


	}

function parse_figure(figure){
	result = {}

	sid = parseInt(figure.id.substring(4))
	result['sid'] = sid

	links = figure.querySelectorAll('a')
	for (var entry of links) {
		if (entry.title == '') {continue}
		if (entry.href.includes('user')) {
			result['artist'] = entry
			}
		else {
			result['title'] = entry
			}	
		}

	return result
	}

get_items()

}
