import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

let Module = null
if (true) {
  import('/ModuleA.js').then(function (module) {
    Module = module.ModuleA
    main()
  })
}
else {
  import('/ModuleB.js').then(function (module) {
    Module = module.ModuleB
    main()
  })
}

class App extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ])
  }

  render () {
    return (
      <div>
        <h1>THIS IS AN APP</h1>
        {this.props.children}
      </div>
    )
  }
}

function main () {
  ReactDOM.render(
    <App>
      <Module />
    </App>, document.getElementById('app')
  )
}
