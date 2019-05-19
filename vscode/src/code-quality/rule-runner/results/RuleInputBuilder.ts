import * as fs from 'fs';

export class RuleInputBuilder {
    public from_time_series_output(filename : string) : string | undefined {
        let data = fs.readFileSync(filename, { encoding: 'utf-8' });
        
        let json = JSON.parse(data);

        if (json['type'] !== 'monitoring') {
            return undefined;
        }

        let output_data : string[] = [];
        output_data.push('devices:');
        output_data.push(this.get_indent(1) + 'device-a:');
        output_data.push(this.get_indent(2) + 'metrics:');
        for (let res of json['result']) {
            if (res['type'] !== 'ts') {
                continue;
            }
            output_data.push(this.get_indent(3) + '-');
            output_data.push(this.get_indent(4) + 'type: ' + res['type']);
            output_data.push(this.get_indent(4) + 'name: ' + res['tags']['im.name']);
            output_data.push(this.get_indent(4) + 'tags:');
            for (let tag in res['tags']) {
                if (tag !== 'im.name') {
                    output_data.push(this.get_indent(5) + tag + ': ' + res['tags'][tag]);
                }
            }
            output_data.push(this.get_indent(4) + 'data: [' + Number(res['value']).toFixed(1) + ']');
        }

        return output_data.join('\n');
    }

    private get_indent(indent : number) : string {
        let result : string = '';
        indent = indent * 4;
        for (let i = 0; i < indent; i++) {
            result += ' ';
        }
        return result;
    }
}

/*
devices:
    device-a: # device ID
        tags: # device's tags
            x: y
            n: 1
            n2: 2.0
            b: true
        metrics: # device's metrics
            -
                type: ts # time-series / double metric
                name: cpu-usage1 # im.type
                tags: # metrics' tags (optional)
                    cpu-id: 1
                data: [1, 1, null, 2.0] # the time-series points. First is the oldest while last is the latest.
                */