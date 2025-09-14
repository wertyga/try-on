import ToastExternal, {
  ErrorToast,
  SuccessToast,
} from 'react-native-toast-message';

export const Toast = () => {
  return (
    <ToastExternal
      config={{
        success: props => (
          <SuccessToast
            {...props}
            style={{ height: 50, borderLeftColor: 'green' }}
            contentContainerStyle={{ paddingLeft: 5 }}
            text1Style={{
              fontSize: 12,
              padding: 10,
            }}
            text2Style={{
              fontSize: 12,
            }}
          />
        ),
        error: props => (
          <ErrorToast
            {...props}
            style={{
              borderLeftColor: 'red',
              height: 50,
              zIndex: 100,
            }}
            contentContainerStyle={{ paddingLeft: 5 }}
            text1Style={{
              fontSize: 12,
              padding: 10,
            }}
            text2Style={{
              fontSize: 12,
            }}
          />
        ),
      }}
    />
  );
};
