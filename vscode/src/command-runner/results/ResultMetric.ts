export class ResultMetric
{
    public name : string | undefined = undefined;
    public tags : ResultMetricTag[] = [];
    public value : any;
    public raw_data : string | undefined = undefined;

    //DoubleMetric(Map(im.dstype -> gauge, im.dstype.displaytype -> state, im.name -> ntp-is-synchronized, live-config -> true, display-name -> NTP Synchronization Status),1.0,0)
    //ComplexMetric(Map(im.name -> arp-table),[{"success":"1","interface":"0:0","mac":"00:0c:29:0a:db:a3","targetip":"10.3.3.71"},{"success":"1","targetip":"10.3.3.72","interface":"0:0","mac":"00:0c:29:0a:db:a3"},{"targetip":"10.3.3.29","interface":"0:0","success":"1","mac":"00:1b:17:00:3e:11"},{"mac":"00:50:56:80:1a:54","interface":"0:0","success":"1","targetip":"10.3.3.61"},{"interface":"0:0","mac":"00:50:56:80:79:ba","success":"1","targetip":"10.3.3.62"},{"mac":"00:50:56:a0:76:7f","interface":"0:0","success":"1","targetip":"10.3.3.124"},{"interface":"0:0","mac":"08:cc:68:0c:b6:c5","targetip":"10.3.3.1","success":"1"},{"targetip":"10.3.3.2","interface":"0:0","success":"0","mac":"incomplete"}],0)
    public parse_from_test(text : string) : boolean {
        this.raw_data = text;
        text = text.trim();

        let regex_tags = /Map\(([^\)]+)/g;
        let tags_match = regex_tags.exec(text);
        if (tags_match !== null) {
            this.parse_tags_from_test(tags_match[1]);
        }
    }

    parse_tags_from_test(tags_data : string) {
        let tags_regexp = /([^\s]+)\s+->\s+([^\s,]+)/g;
        let match;
        while (match = tags_regexp.exec(tags_data)) {
            if (match.length > 1) {
                let tag = new ResultMetricTag();
                tag.name = match[1];
                tag.value = match[2];
                this.tags.push(tag);

                if (tag.name === 'im.name') {
                    this.name = tag.value;
                }
            }
        }

        if (this.name === undefined) {
            return false;
        }


    }


    /*
    2019-05-01 22:41:39,146 INFO   -- Metric Name: arp-table ||| Tags: im.step = 300 ||| Value: [ {
        "success" : "1",
        "interface" : "0:0",
        "mac" : "00:0c:29:0a:db:a3",
        "targetip" : "10.3.3.71"
    } ]
    */
    public parse(text : string) : boolean {
        this.raw_data = text;
        let match_name = /Metric Name:\s+(\S+)/gs;
        let match_tags = /Tags:\s+([^\|]+)/gs;
        let match_value = /Value:\s(.*)/gs;

        let name = text.match(match_name);
        if (name !== null) {
            this.name = name[0].slice('Metric Name: '.length, name[0].length).trim();
        }

        if (this.name === undefined) {
            return false;
        }

        let tags = text.match(match_tags);
        if (tags !== null) {
            for (let tag_info of tags[0].split(',')) {
                tag_info = tag_info.trim();
                if (tag_info.startsWith('Tags: ')) {
                    tag_info = tag_info.slice('Tags: '.length, tag_info.length);
                }

                let idx_equals = tag_info.indexOf('=');
                if (idx_equals !== undefined) {
                    let key = tag_info.slice(0, idx_equals - 1);
                    let value = tag_info.slice(idx_equals, tag_info.length);
                    let tag_obj = new ResultMetricTag();
                    tag_obj.name = key;
                    tag_obj.value = value;
                    this.tags.push(tag_obj);
                }
            }
        }

        let value = text.match(match_value);
        if (value !== null) {
            this.value = value[0].slice('Value: '.length, value[0].length).trim();
        }
        
        return true;
    }

    public static parse_from_text(text : string) : ResultMetric[] {
        let result : ResultMetric[] = [];
        let metric_sections_match = /-- Metric Name:.+?(?=[0-9]{4}\-[0-9]{2}\-[0-9]{2}\s|$)/gs;
        let match;
        while (match = metric_sections_match.exec(text)) {
            let metric = new ResultMetric();
            if (metric.parse(match[0])) {
                result.push(metric);
            }
        }

        return result;
    }
}

export class ResultMetricTag {
    public name : string | undefined = undefined;
    public value : string | undefined = undefined;
}