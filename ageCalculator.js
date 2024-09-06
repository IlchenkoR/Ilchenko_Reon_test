function calculateAge(birthDate) {
	const today = new Date()
	const birth = new Date(birthDate * 1000)
	const age = today.getFullYear() - birth.getFullYear()
	const month = today.getMonth() - birth.getMonth()

	if(month < 0 || (month == 0 && today.getDate() < birth.getDate)){
		age--
	}
	if (age < 0) {
        age = 0;
    }
	return age
}
module.exports = calculateAge