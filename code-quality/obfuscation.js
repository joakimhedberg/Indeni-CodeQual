
function initiateObfuscations(){

    // On each update the result field should be reset
    $("textarea#input-textarea").on("keyup", function(){
        $("pre#obfuscation-result-content").html($("textarea#input-textarea").val());
    });
    $("textarea#input-textarea").trigger("keyup");
    
    // Build the obfuscation options from the obfuscate functions
    for(const name in obfuscateFunctions){

        const f = obfuscateFunctions[name];
        //Append the functions input data
        $("div#obfuscation-types").append("<div id=\"" + name + "\">" + f.obfuscationOptionData + "</div>")
        // Apply the handlers
        f.applyHandler(name);
    }
}

var obfuscateFunctions = {

    "ipAddresses": new function(){

        // Obfuscates IP adresses
        this.obfuscationOptionData = "Replaces IP addresses with the following /24 prefix (ie. 192.168.1): <input></input>";
        this.obfuscationType = "input"

        this.run = function(){

            var content = $("textarea#input-textarea").val();
            var subnet = $(this).val();

            // Validate the input data
            if(subnet.match(/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/)){

                // Show that the value is accepted by changing the background color to green
                $(this).css("background", "#44EC88");
                $(this).css("color", "black");

                // Replace the subnets in the input file with the input value
                content = content.replace(/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/g, "<span class=\"obfuscated\">" + subnet + "</span>");
                $("pre#obfuscation-result-content").html(content);

            } else {

                // Show that the value is not a valid one by changing the background to red
                $(this).css("background", "red");
                $(this).css("color", "white");

            }

        }

        // Applies the handler to the object
        this.applyHandler = function(name){
            $("div#" + name + " " + this.obfuscationType).on("keyup", this.run)
        }

    }
}