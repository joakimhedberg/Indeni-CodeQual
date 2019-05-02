export class CommandRunnerTestCase {
    public name : string;
    public success : boolean = false;

    public constructor(name : string, raw_data : string)    {
        this.name = name;
        this.parse_info(raw_data);
    }

    parse_info(data : string) {
        let success_regex = new RegExp("'" + this.name +"' has been completed successfully", 'g');
        if (data.match(success_regex) !== null) {
            this.success = true;
            return;
        }

        let fail_regex = new RegExp(this.name + "' failed.+?(?=[0-9]{4}\-[0-9]{2}\-[0-9]{2}\s|$)", 'gs');
        let match = fail_regex.exec(data);
        if (match !== null) {
            this.parse_fail_data(match[0]);
        }
    }

    parse_fail_data(data : string) {
        console.log(data);
        let expected_regex = /Expected:\s?(.+?)(?=But got)/gs;
        let got_regex = /But got:\s?(.*)/gs;

        let match_expected = expected_regex.exec(data);
        let got_expected = got_regex.exec(data);
        if (match_expected !== null && got_expected !== null) {

        }
    }
}