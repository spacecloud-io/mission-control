import { get, set } from 'automate-redux';
import store from '../../store';


export const mapStateToProps = (state, ownProps) => {
    const selectedDb = ownProps.match.params.database;
    return {
      selectedDb: ownProps.match.params.database,
      formState: {
        enabled: get(
          state,
          `config.modules.crud.${ownProps.match.params.database}.enabled`,
          false
        ),
        conn: get(
          state,
          `config.modules.crud.${ownProps.match.params.database}.conn`
        )
      },
      rules: get(
        state,
        `config.modules.crud.${ownProps.match.params.database}.collections`,
        {}
      ),
      selectedCollection: get(state, 'collection', 0),
      graphs: get(state, `config.modules.crud.${selectedDb}.collections`, {})
    };
  };
  
  export const mapDispatchToProps = (dispatch, ownProps, state) => {
    const selectedDb = ownProps.match.params.database;
    return {

      handleCreateGraph: values => {
        const callName = values.item;
        let graph = {
          isRealtimeEnabled: true,
          rules: values.rules,
          schema: values.schema
        };
  
        dispatch(
          set(`config.modules.crud.${selectedDb}.collections.${callName}`, graph)
        );
      },
      updateFormState: fields => {
        const dbConfig = get(
          store.getState(),
          `config.modules.crud.${selectedDb}`,
          {}
        );
        dispatch(
          set(
            `config.modules.crud.${selectedDb}`,
            Object.assign({}, dbConfig, fields)
          )
        );
      },
      handleSelection: collectionid => {
        dispatch(set('collection', collectionid));
      }
    };
  };