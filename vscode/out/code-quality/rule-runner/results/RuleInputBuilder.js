"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class RuleInputBuilder {
    from_time_series_output(filename) {
        let data = fs.readFileSync(filename, { encoding: 'utf-8' });
        let json = JSON.parse(data);
        if (json['type'] !== 'monitoring') {
            return undefined;
        }
        let output_data = [];
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
    get_indent(indent) {
        let result = '';
        indent = indent * 4;
        for (let i = 0; i < indent; i++) {
            result += ' ';
        }
        return result;
    }
}
exports.RuleInputBuilder = RuleInputBuilder;
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
//# sourceMappingURL=RuleInputBuilder.js.map