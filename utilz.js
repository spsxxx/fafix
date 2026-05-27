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


