import Foundation
import Capacitor
import AuthenticationServices

@objc(NexoAppleAuthPlugin)
public class NexoAppleAuthPlugin: CAPPlugin, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    
    private var pluginCall: CAPPluginCall?
    
    @objc func authorize(_ call: CAPPluginCall) {
        self.pluginCall = call
        
        DispatchQueue.main.async {
            let appleIDProvider = ASAuthorizationAppleIDProvider()
            let request = appleIDProvider.createRequest()
            request.requestedScopes = [.fullName, .email]
            
            let authorizationController = ASAuthorizationController(authorizationRequests: [request])
            authorizationController.delegate = self
            authorizationController.presentationContextProvider = self
            authorizationController.performRequests()
        }
    }
    
    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return self.bridge!.viewController!.view.window!
    }
    
    public func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        guard let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential else {
            self.pluginCall?.reject("Invalid credential type")
            return
        }
        
        var result: [String: Any] = [:]
        result["user"] = appleIDCredential.user
        result["state"] = appleIDCredential.state ?? ""
        result["givenName"] = appleIDCredential.fullName?.givenName ?? ""
        result["familyName"] = appleIDCredential.fullName?.familyName ?? ""
        result["email"] = appleIDCredential.email ?? ""
        
        if let identityToken = appleIDCredential.identityToken,
           let tokenString = String(data: identityToken, encoding: .utf8) {
            result["identityToken"] = tokenString
        }
        
        if let authorizationCode = appleIDCredential.authorizationCode,
           let codeString = String(data: authorizationCode, encoding: .utf8) {
            result["authorizationCode"] = codeString
        }
        
        self.pluginCall?.resolve(result)
    }
    
    public func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        let nsError = error as NSError
        // Code 1001 = user cancelled — no es un error real
        if nsError.code == 1001 {
            self.pluginCall?.reject("USER_CANCELLED")
        } else {
            self.pluginCall?.reject(error.localizedDescription)
        }
    }
}
