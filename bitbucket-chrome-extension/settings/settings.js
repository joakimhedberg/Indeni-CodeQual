
settings = {
    "roles": ["Script writer", "Rule writer"],
    "toDos": {
        "loadbalancingCodeQual": {
            "appliesTo": ["Script writer"],
            "description": "Verify the code with the <a href=\"https://loadbalancing.se/indeni/indeni.html\">Indeni CodeQual tool</a>.",
            "externalLink": "https://indeni.atlassian.net/wiki/spaces/IKP/pages/81794466/Code+Review+Pull+Requests",
        },
        "positiveAndNegatigeMatches": {
            "appliesTo": ["Script writer"],
            "description": "Create positive and negative test cases.",
            "externalLink": "",
        },
        "blankTestForInterrogationScript": {
            "appliesTo": ["Script writer"],
            "description": "If this is an interrogation script, provide an empty test file to prevent incorrect tagging",
            "externalLink": "",
        },
        "newMetricsReuseCheck": {
            "appliesTo": ["Script writer"],
            "description": "If the script contains a new metric, check the known metrics list to verify if an old one can be used.",
            "externalLink": "https://indeni.atlassian.net/wiki/pages/viewpage.action?pageId=57147403",
        },
        "newMetricsDocumented": {
            "appliesTo": ["Script writer"],
            "description": "If the script contains a new metric, either prefix it with the vendor or document it at the known metrics wiki page",
            "externalLink": "https://indeni.atlassian.net/wiki/pages/viewpage.action?pageId=57147403",
        },
        "alertScreenshot": {
            "appliesTo": ["Rule writer", "Script writer"],
            "description": "Provide an alert screenshot.",
            "externalLink": "",
        }
    }
}

// Workaround to enable tests with mocha chai
if(typeof(module) === 'object'){
    module.exports = settings;
}