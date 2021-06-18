import React from 'react';
import SimpleMarkdown from 'simple-markdown';
import hljs from 'highlight.js';

class Spoiler extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			contentShown: false
		}
	}
	
	componentDidMount() {
		this.setState({
			contentShown: false
		});
	}

	handleClick() {
		this.setState({
			contentShown: true
		});
	}

	render() {
		let className = "spoiler";
		if (this.state.contentShown) {
			className += " spoiler-shown";
		}

		return <span className={className} onClick={this.handleClick.bind(this)}><span>{this.props.children}</span></span>
	}
}

let currentOrder = 0;

const rules = {
	escape: {
		...SimpleMarkdown.defaultRules.escape,
		order: currentOrder
	},
	codeBlock: {
		order: ++currentOrder,
		match: SimpleMarkdown.inlineRegex(/^```(\w*)\n+([\s\S]+)\n+```/),
		parse: (capture, parse, state) => {
			return {
				lang: capture[1],
				content: capture[2]
			}
		},
		react: (node, output, state) => {
			let html = {__html: hljs.highlight(node.content, {language: node.lang, ignoreIllegals: true}).value};
			return <div key={state.key} className="codeBlock" dangerouslySetInnerHTML={html} />
		}
	},
	blockQuote: {
		...SimpleMarkdown.defaultRules.blockQuote,
		order: ++currentOrder,
		match: SimpleMarkdown.inlineRegex(/^(> ([^\n]*)\n)*> ([^\n]*)/),
		react: (node, output, state) => {
			return <div key={state.key} className="blockquoteContainer">
				<div className="blockquoteDivider" />
				<blockquote>{output(node.content, state)}</blockquote>
			</div>
		}
	},
	url: {
		order: ++currentOrder,
		match: SimpleMarkdown.inlineRegex(/^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/),
		parse: (capture, parse, state) => {
			return {
				content: capture[1]
			};
		},
		react: (node, output, state) => {
			let sanitizedUrl = SimpleMarkdown.sanitizeUrl(node.content);
			return <a key={state.key} href={sanitizedUrl}>{sanitizedUrl}</a>
		}
	},
	em: {
		...SimpleMarkdown.defaultRules.em,
		order: ++currentOrder
	},
	strong: {
		...SimpleMarkdown.defaultRules.strong,
		order: currentOrder
	},
	u: {
		...SimpleMarkdown.defaultRules.u,
		order: currentOrder
	},
	del: {
		...SimpleMarkdown.defaultRules.del,
		order: ++currentOrder
	},
	spoiler: {
		order: ++currentOrder,
		match: SimpleMarkdown.inlineRegex(/^\|\|((?:\\[\s\S]|[^\\])+?)\|\|/),
		parse: (capture, parse, state) => ({
			content: parse(capture[1], state)
		}),
		react: (node, output, state) => {
			return <Spoiler key={state.key}>{output(node.content, state)}</Spoiler>
		}
	},
	inlineCode: {
		...SimpleMarkdown.defaultRules.inlineCode,
		order: ++currentOrder
	},
	text: {
		...SimpleMarkdown.defaultRules.text,
		order: ++currentOrder
	}
};

const parser = SimpleMarkdown.parserFor(rules);
const output = SimpleMarkdown.outputFor(rules, 'react');

class Markdown extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return output(parser(this.props.md, {inline: true}));
	}
}

export default Markdown;
